#!/bin/bash

# Start PostgreSQL
echo "Starting PostgreSQL..."
/etc/init.d/postgresql start

# Wait for PostgreSQL to be ready
until pg_isready; do
  echo "Waiting for PostgreSQL to be ready..."
  sleep 1
done

# Run migrations if database exists
echo "Running database migrations..."
cd /app/backend
PYTHONPATH=/app/backend PYTHONNOUSERSITE=1 /opt/venv/backend/bin/python -m alembic upgrade head

# Start Supervisor
echo "Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/conf.d/supervisord.conf
