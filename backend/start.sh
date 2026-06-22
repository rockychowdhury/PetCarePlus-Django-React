#!/usr/bin/env bash
# exit on error
set -o errexit

# Start Django Q cluster in the background
python manage.py qcluster &

# Start Gunicorn with a longer timeout for heavy AI imports
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --timeout 120
