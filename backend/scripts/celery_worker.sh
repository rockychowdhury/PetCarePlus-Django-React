# Navigate to backend root
cd "$(dirname "$0")/.."

set -e

echo "Starting Celery Worker..."
celery -A PetCarePlus worker --loglevel=info
