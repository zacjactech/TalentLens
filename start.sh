#!/bin/bash

# Environment variables should be provided via Hugging Face Secrets.
# We no longer load local .env files to avoid shadowing secrets.

# Adjust service URLs for single-container mode (HF Spaces)
if [ -n "$MINIO_ENDPOINT" ] && [ "$MINIO_ENDPOINT" = "minio:9000" ]; then
    echo "Adjusting MINIO_ENDPOINT to localhost:9000"
    export MINIO_ENDPOINT="localhost:9000"
fi

if [ -n "$REDIS_URL" ] && [ "$REDIS_URL" = "redis://redis:6379/0" ]; then
    echo "Adjusting REDIS_URL to redis://localhost:6379/0"
    export REDIS_URL="redis://localhost:6379/0"
fi

# Run migrations
echo "Running database migrations..."
cd /app/backend
PYTHONPATH=/app/backend PYTHONNOUSERSITE=1 /opt/venv/backend/bin/python -m alembic upgrade head

# Start Supervisor
echo "Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
