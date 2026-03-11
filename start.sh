#!/bin/bash

# Load environment variables from .env if present (prevents local DB fallback if secret isn't set yet)
if [ -f /app/.env ]; then
    echo "Loading environment from /app/.env"
    export $(grep -v '^#' /app/.env | sed 's/ *= */=/g' | xargs)
fi

# In single-container environments (like HF Spaces with supervisord), 
# services like MinIO and Redis run on localhost, not separate hostnames.
if [ -n "$MINIO_ENDPOINT" ] && [ "$MINIO_ENDPOINT" = "minio:9000" ]; then
    echo "Adjusting MINIO_ENDPOINT to localhost:9000 for single-container mode"
    export MINIO_ENDPOINT="localhost:9000"
fi

if [ -n "$REDIS_URL" ] && [ "$REDIS_URL" = "redis://redis:6379/0" ]; then
    echo "Adjusting REDIS_URL to redis://localhost:6379/0 for single-container mode"
    export REDIS_URL="redis://localhost:6379/0"
fi

# Check if using external database
USE_EXTERNAL_DB=false
if [[ "$DATABASE_URL" == *"supabase.com"* ]] || [[ "$DATABASE_URL" == *"pooler.supabase.com"* ]]; then
    USE_EXTERNAL_DB=true
    echo "Using external database: $DATABASE_URL"
else
    echo "DATABASE_URL does not appear to be external. Falling back to local PostgreSQL."
fi

if [ "$USE_EXTERNAL_DB" = false ]; then
    # Start PostgreSQL locally
    echo "Starting PostgreSQL..."
    /etc/init.d/postgresql start

    # Wait for PostgreSQL to be ready
    until pg_isready; do
      echo "Waiting for PostgreSQL to be ready..."
      sleep 1
    done

    # Ensure the database and user exist (using secrets provided by HF Space)
    echo "Ensuring database user and DB exist..."
    if [ -n "$POSTGRES_USER" ] && [ -n "$POSTGRES_PASSWORD" ]; then
        sudo -u postgres psql --command "CREATE USER $POSTGRES_USER WITH SUPERUSER PASSWORD '$POSTGRES_PASSWORD';" || echo "User already exists or error."
    fi

    if [ -n "$POSTGRES_DB" ] && [ -n "$POSTGRES_USER" ]; then
        sudo -u postgres createdb -O $POSTGRES_USER $POSTGRES_DB || echo "Database already exists or error."
    fi
fi

# Run migrations
echo "Running database migrations..."
cd /app/backend
PYTHONPATH=/app/backend PYTHONNOUSERSITE=1 /opt/venv/backend/bin/python -m alembic upgrade head

if [ "$USE_EXTERNAL_DB" = false ]; then
    # Stop PostgreSQL to let Supervisor manage it (in foreground)
    echo "Stopping temporary PostgreSQL..."
    /etc/init.d/postgresql stop
fi

# Start Supervisor
echo "Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
