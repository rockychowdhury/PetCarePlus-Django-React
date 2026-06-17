"""
PetCarePlus v2 — Development settings
SQLite fallback, DEBUG=True, relaxed CORS.
"""

from .base import *  # noqa: F401, F403

DEBUG = True

# Use SQLite for local development (no PostgreSQL required)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Accept all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Console email backend for development
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# Relaxed security for local dev
SECURE_PROXY_SSL_HEADER = None
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False
