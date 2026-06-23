"""
PetCarePlus v2 — Production settings
PostgreSQL via DATABASE_URL, SSL, Cloudflare R2 storage.
"""

import dj_database_url
from .base import *  # noqa: F401, F403

DEBUG = False

# ──────────────────────────────────────────────
# Database — PostgreSQL via DATABASE_URL
# ──────────────────────────────────────────────

DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=0,
        conn_health_checks=True,
        disable_server_side_cursors=True,
        ssl_require=True,
    )
}

# ──────────────────────────────────────────────
# Security
# ──────────────────────────────────────────────

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
CSRF_COOKIE_HTTPONLY = True

CSRF_TRUSTED_ORIGINS = get_env(
    'CSRF_TRUSTED_ORIGINS',
    default='https://petcarepp.netlify.app',
    cast=lambda v: [s.strip() for s in v.split(',')]
)

# ──────────────────────────────────────────────
# CORS — restrict to frontend domain
# ──────────────────────────────────────────────

CORS_ALLOW_ALL_ORIGINS = False

# ──────────────────────────────────────────────
# Email — SMTP for production
# ──────────────────────────────────────────────

EMAIL_BACKEND = get_env(
    'EMAIL_BACKEND',
    default='django.core.mail.backends.smtp.EmailBackend'
)
EMAIL_HOST = get_env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = get_env('EMAIL_PORT', default=587, cast=int)
EMAIL_USE_TLS = get_env('EMAIL_USE_TLS', default=True, cast=bool)
EMAIL_HOST_USER = get_env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = get_env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = get_env('EMAIL_HOST_USER', default='noreply@petcareplus.app')
