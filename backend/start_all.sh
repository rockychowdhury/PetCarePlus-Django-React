#!/bin/bash
# Proxy script for backward compatibility
echo "Using legacy start_all.sh path. Redirecting to scripts/start_dev_server.sh..."
exec /app/scripts/start_dev_server.sh "$@"
