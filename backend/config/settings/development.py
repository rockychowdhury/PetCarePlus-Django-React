"""
PetCarePlus v2 — Development settings
SQLite fallback, DEBUG=True, relaxed CORS.
"""

from .base import *  # noqa: F401, F403

DEBUG = True

import os
import dj_database_url

# Use PostgreSQL if DATABASE_URL is provided, else fallback to SQLite
DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv('DATABASE_URL', f"sqlite:///{BASE_DIR / 'db.sqlite3'}"),
        conn_max_age=600
    )
}

# Accept all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Console email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Relaxed security for local dev
SECURE_PROXY_SSL_HEADER = None
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
