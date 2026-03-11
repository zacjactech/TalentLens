# Use a Python base image with broad compatibility
FROM python:3.10-bullseye

# Skip interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1
ENV DATABASE_URL=postgresql://talentlens:talentlens@localhost:5432/talentlens_db
ENV REDIS_URL=redis://localhost:6379/0
ENV MINIO_ENDPOINT=localhost:9000
ENV MINIO_ACCESS_KEY=minioadmin
ENV MINIO_SECRET_KEY=minioadmin
ENV JWT_ALGORITHM=HS256
ENV ACCESS_TOKEN_EXPIRE_MINUTES=30
ENV INTERNAL_API_KEY=hf_internal_key

# Install system dependencies for all services
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    lsb-release \
    build-essential \
    libpq-dev \
    postgresql \
    redis-server \
    nginx \
    supervisor \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js for frontend build
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm

# Install MinIO
RUN wget https://dl.min.io/server/minio/release/linux-amd64/minio \
    -O /usr/local/bin/minio && \
    chmod +x /usr/local/bin/minio

# Set up working directory
WORKDIR /app

# Create necessary directories and set permissions for HF user (UID 1000)
RUN mkdir -p /app/backend /app/frontend /app/chatbot /data/minio /var/lib/postgresql /var/log/supervisor /var/run/postgresql /var/run/redis && \
    chmod -R 777 /data /var/log /var/run /var/lib/postgresql /var/lib/redis

# Copy project files
COPY . .

# Build Frontend
WORKDIR /app/frontend
# Inject relative API URL during build
RUN export VITE_API_URL=/api/v1 && \
    pnpm install && \
    pnpm run build && \
    mkdir -p /var/www/html && \
    cp -r dist/* /var/www/html/

# Install Backend Dependencies
WORKDIR /app/backend
RUN pip install --no-cache-dir -r requirements.txt

# Install Chatbot Dependencies
WORKDIR /app/chatbot
RUN pip install --no-cache-dir -r requirements.txt

# Initial setup for Postgres (this part runs during build to prep the DB files)
# Note: HF runtime might reset some of this if not using persistent storage,
# but we need the DB created and schema applied.
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER talentlens WITH SUPERUSER PASSWORD 'talentlens';" && \
    createdb -O talentlens talentlens_db && \
    # Apply migrations if possible
    cd /app/backend && \
    PYTHONPATH=/app/backend alembic upgrade head
USER root

# Configure Nginx and Supervisor
RUN rm /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/sites-enabled/talentlens.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Permissions for logs and runtime files
RUN touch /var/log/supervisord.log /var/run/supervisord.pid && \
    chmod 666 /var/log/supervisord.log /var/run/supervisord.pid && \
    chmod -R 777 /var/log/nginx /var/lib/nginx

# HF Spaces requires exposing 7860
EXPOSE 7860

# The app should run as a non-root user if possible, but supervisor often needs root to start services
# For HF, we'll try running as root and supervisor will manage sub-processes
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
