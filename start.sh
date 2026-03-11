#!/bin/bash

# Start PostgreSQL
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

# Run migrations
echo "Running database migrations..."
cd /app/backend
PYTHONPATH=/app/backend PYTHONNOUSERSITE=1 /opt/venv/backend/bin/python -m alembic upgrade head

# Start Supervisor
echo "Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
