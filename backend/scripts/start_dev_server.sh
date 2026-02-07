# Navigate to backend root
cd "$(dirname "$0")/.."

set -e

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Starting Celery Worker in background..."
celery -A PetCarePlus worker --loglevel=info --concurrency=2 &

echo "Starting Gunicorn Server..."
exec gunicorn PetCarePlus.wsgi:application --bind 0.0.0.0:8000
