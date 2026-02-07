#!/bin/bash
# Proxy script for backward compatibility
echo "Using legacy celery_worker.sh path. Redirecting to scripts/celery_worker.sh..."
exec /app/scripts/celery_worker.sh "$@"
