#!/usr/bin/env bash
# exit on error
set -o errexit

# Start Django Q cluster in the background
python manage.py qcluster &

# Start Gunicorn
gunicorn PetCarePlus.wsgi:application --bind 0.0.0.0:$PORT
