#!/bin/bash
set -e

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Starting Gunicorn..."
exec gunicorn PetCarePlus.wsgi:application --bind 0.0.0.0:8000
