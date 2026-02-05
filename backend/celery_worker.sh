#!/bin/bash
set -e

echo "Starting Celery Worker..."
celery -A PetCarePlus worker --loglevel=info
