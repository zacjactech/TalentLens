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

# Create necessary directories and set permissions
RUN mkdir -p /app/backend /app/frontend /app/chatbot /data/minio /var/log/supervisor /var/run/postgresql /var/run/redis && \
    chmod -R 777 /data /var/log /var/run /var/lib/redis

# ---- Dependency Phase (Caching Optimized) ----
# Copy only requirements first to leverage Docker layer caching
COPY backend/requirements.txt /app/backend/
COPY chatbot/requirements.txt /app/chatbot/

# Cleanup ANY global packages that might conflict (if they exist)
RUN pip uninstall -y pydantic pydantic-settings alembic fastapi uvicorn

# ---- Backend venv (pydantic v2) ----
RUN python -m venv /opt/venv/backend && \
    /opt/venv/backend/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/backend/bin/pip install --no-cache-dir -r /app/backend/requirements.txt && \
    # Diagnostics
    echo "Backend Venv Check:" && \
    /opt/venv/backend/bin/python -c "import pydantic; import pydantic_settings; print(f'Pydantic: {pydantic.VERSION}'); print(f'Settings File: {pydantic_settings.__file__}')"

# ---- Chatbot venv (pydantic v1 / Rasa) ----
RUN python -m venv /opt/venv/chatbot && \
    /opt/venv/chatbot/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/chatbot/bin/pip install --no-cache-dir -r /app/chatbot/requirements.txt && \
    # Diagnostics
    echo "Chatbot Venv Check:" && \
    /opt/venv/chatbot/bin/python -c "import pydantic; print(f'Pydantic: {pydantic.VERSION}')"

# ---- App Phase ----
# Copy the rest of the application code
COPY . .

# Build Frontend
WORKDIR /app/frontend
RUN export VITE_API_URL=/api/v1 && \
    pnpm install && \
    pnpm run build && \
    mkdir -p /var/www/html && \
    cp -r dist/* /var/www/html/

# Ensure postgres has correct permissions before switching user
RUN chown -R postgres:postgres /var/lib/postgresql /var/run/postgresql && \
    chmod -R 700 /var/lib/postgresql && \
    # IMPORTANT: Ensure postgres can access the backend venv for migrations
    chmod -R 755 /opt/venv

# Setup database and run migrations using the backend venv EXPLICITLY
USER postgres
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER talentlens WITH SUPERUSER PASSWORD 'talentlens';" && \
    createdb -O talentlens talentlens_db && \
    cd /app/backend && \
    # VERBOSE DEBUGGING
    echo "ENVIRONMENT DIAGNOSTICS:" && \
    echo "User: $(whoami)" && \
    echo "Python: $(/opt/venv/backend/bin/python --version)" && \
    echo "Pip List (Backend):" && /opt/venv/backend/bin/pip list && \
    echo "Python Path: $PYTHONPATH" && \
    echo "Sys Path: $(/opt/venv/backend/bin/python -c 'import sys; print(sys.path)')" && \
    PYTHONPATH=/app/backend PYTHONNOUSERSITE=1 /opt/venv/backend/bin/python -m alembic upgrade head
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

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

