# Use a modern, light Python base image
# Force rebuild: 2026-03-11 10:40
FROM python:3.10-slim-bookworm

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

# Install system dependencies
# Note: Bookworm uses PostgreSQL 15 by default
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    procps \
    build-essential \
    libpq-dev \
    postgresql-15 \
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
RUN mkdir -p /app/backend /app/frontend /app/chatbot /data/minio /var/log/supervisor /var/run/postgresql /var/run/redis /var/lib/postgresql && \
    chmod -R 777 /data /var/log /var/run /var/lib/redis /var/lib/postgresql

# ---- Dependency Phase (Caching Optimized) ----
COPY backend/requirements.txt /app/backend/
COPY chatbot/requirements.txt /app/chatbot/

# Strict isolation: Ensure no global pydantic versions exist to confuse resolvers
RUN pip uninstall -y pydantic pydantic-settings alembic fastapi uvicorn

# ---- Backend venv (pydantic v2) ----
RUN python -m venv /opt/venv/backend && \
    /opt/venv/backend/bin/pip install --no-cache-dir --upgrade pip setuptools wheel && \
    /opt/venv/backend/bin/pip install --no-cache-dir --upgrade -r /app/backend/requirements.txt && \
    # Diagnostics
    echo "Backend Venv Check:" && \
    /opt/venv/backend/bin/python -c "import pydantic; import pydantic_settings; import packaging; print(f'Pydantic: {pydantic.VERSION}'); print(f'Packaging: {packaging.__version__}')"

# ---- Chatbot venv (pydantic v1 / Rasa) ----
RUN python -m venv /opt/venv/chatbot && \
    /opt/venv/chatbot/bin/pip install --no-cache-dir --upgrade pip setuptools wheel && \
    /opt/venv/chatbot/bin/pip install --no-cache-dir --upgrade -r /app/chatbot/requirements.txt && \
    # Diagnostics
    echo "Chatbot Venv Check:" && \
    /opt/venv/chatbot/bin/python -c "import pydantic; print(f'Pydantic: {pydantic.VERSION}')"

# ---- App Phase ----
COPY . .

# Build Frontend
WORKDIR /app/frontend
RUN export VITE_API_URL=/api/v1 && \
    pnpm install && \
    pnpm run build && \
    mkdir -p /var/www/html && \
    cp -r dist/* /var/www/html/

# Ensure postgres has correct permissions
# Path changed for PostgreSQL 15
RUN chown -R postgres:postgres /var/lib/postgresql /var/run/postgresql && \
    chmod -R 700 /var/lib/postgresql && \
    chmod -R 755 /opt/venv

# Setup database and run migrations
USER postgres
# PostgreSQL 15 service command
RUN /etc/init.d/postgresql start && \
    psql --command "CREATE USER talentlens WITH SUPERUSER PASSWORD 'talentlens';" && \
    createdb -O talentlens talentlens_db && \
    cd /app/backend && \
    echo "MIGRATION DIAGNOSTICS:" && \
    PYTHONPATH=/app/backend PYTHONNOUSERSITE=1 /opt/venv/backend/bin/python -m alembic upgrade head
# Configure Nginx and Supervisor
USER root
RUN mkdir -p /etc/nginx/sites-enabled && \
    rm -f /etc/nginx/sites-enabled/default && \
    echo "Nginx directory prepared"
COPY nginx.conf /etc/nginx/sites-enabled/talentlens.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Update supervisord.conf to use PG 15 paths if needed
# We'll adjust it in the next step or ensure it uses service command if possible.
# For now, let's fix path in Dockerfile first.

# Permissions for logs and runtime files
RUN touch /var/log/supervisord.log /var/run/supervisord.pid && \
    chmod 666 /var/log/supervisord.log /var/run/supervisord.pid && \
    chmod -R 777 /var/log/nginx /var/lib/nginx

EXPOSE 7860

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

