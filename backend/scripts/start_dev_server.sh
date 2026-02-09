# Navigate to backend root
cd "$(dirname "$0")/.."

set -e

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Starting Django-Q Cluster in background..."
python manage.py qcluster &

echo "Starting Gunicorn Server..."
exec gunicorn PetCarePlus.wsgi:application --bind 0.0.0.0:8000
