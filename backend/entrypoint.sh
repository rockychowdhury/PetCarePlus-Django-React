#!/bin/bash
set -e

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

if [ "$#" -gt 0 ]; then
    exec "$@"
else
    echo "Starting Gunicorn..."
    exec gunicorn PetCarePlus.wsgi:application --bind 0.0.0.0:${PORT:-8000}
fi
