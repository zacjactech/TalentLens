# Use bullseye which was previously working
FROM python:3.10-bullseye

# Skip interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV PYTHONUNBUFFERED=1

# Install system dependencies
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
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g pnpm

# Install MinIO
RUN wget https://dl.min.io/server/minio/release/linux-amd64/minio \
    -O /usr/local/bin/minio && \
    chmod +x /usr/local/bin/minio

WORKDIR /app

# Create directories and non-root user
RUN useradd -m -s /bin/bash appuser && \
    mkdir -p /app/backend /app/frontend /app/chatbot /data/minio /var/log/supervisor /var/run/postgresql /var/run/redis /var/www/html && \
    chown -R appuser:appuser /app /data /var/log /var/run /var/www/html

# Dependencies
COPY backend/requirements.txt /app/backend/
COPY chatbot/requirements.txt /app/chatbot/

RUN pip uninstall -y pydantic pydantic-settings alembic fastapi uvicorn

# Backend venv
RUN python -m venv /opt/venv/backend && \
    /opt/venv/backend/bin/pip install --no-cache-dir --upgrade pip setuptools wheel && \
    /opt/venv/backend/bin/pip install --no-cache-dir --upgrade -r /app/backend/requirements.txt

# Chatbot venv
RUN python -m venv /opt/venv/chatbot && \
    /opt/venv/chatbot/bin/pip install --no-cache-dir --upgrade pip setuptools wheel && \
    /opt/venv/chatbot/bin/pip install --no-cache-dir --upgrade -r /app/chatbot/requirements.txt

COPY . .

# Train Rasa
RUN /opt/venv/chatbot/bin/rasa train -d chatbot/domain.yml -c chatbot/config.yml --out chatbot/models --data chatbot/data && \
    chown -R appuser:appuser /app/chatbot/models

# Build Frontend
WORKDIR /app/frontend
RUN export VITE_API_URL=/api/v1 && \
    pnpm install && \
    pnpm run build && \
    mkdir -p /var/www/html && \
    cp -r dist/* /var/www/html/

# Permissions
RUN chown -R postgres:postgres /var/lib/postgresql /var/run/postgresql && \
    chmod -R 700 /var/lib/postgresql && \
    chmod -R 755 /opt/venv && \
    chmod +x /app/start.sh

# Database initialization and migrations moved to runtime start.sh

# Nginx and Supervisor
RUN rm -f /etc/nginx/sites-enabled/default && \
    cp /app/nginx.conf /etc/nginx/sites-enabled/talentlens.conf && \
    cp /app/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN touch /var/log/supervisord.log /var/run/supervisord.pid && \
    chmod 666 /var/log/supervisord.log /var/run/supervisord.pid && \
    chmod -R 777 /var/log/nginx /var/lib/nginx

EXPOSE 7860

# Use the startup script to run migrations and then start supervisor
ENTRYPOINT ["/app/start.sh"]
