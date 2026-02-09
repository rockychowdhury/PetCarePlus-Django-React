# Alternative: Database-Based Task Queue (No Redis)

## Overview
For simple background tasks, you can skip Celery/Redis entirely and use Django's database.

## Implementation

### 1. Install Django-Q (Lightweight alternative to Celery)

```bash
pip install django-q
```

### 2. Update settings.py

```python
INSTALLED_APPS = [
    # ... existing apps
    'django_q',
]

# Django-Q Configuration (uses PostgreSQL instead of Redis)
Q_CLUSTER = {
    'name': 'PetCarePlus',
    'workers': 2,  # Number of worker processes
    'recycle': 500,  # Recycle workers after 500 tasks
    'timeout': 600,  # Task timeout (10 minutes)
    'retry': 720,  # Retry timeout (12 minutes)
    'queue_limit': 50,  # Max tasks in queue
    'bulk': 10,  # Batch size for database queries
    'orm': 'default',  # Use Django ORM (PostgreSQL)
    'poll': 10,  # Poll database every 10 seconds
    'ack_failures': True,
    'max_attempts': 3,
}
```

### 3. Run migrations

```bash
python manage.py migrate
```

### 4. Convert your Celery tasks

**Before (Celery):**
```python
# tasks.py
from celery import shared_task

@shared_task
def send_welcome_email(user_id):
    # ... email logic
    pass
```

**After (Django-Q):**
```python
# tasks.py
from django_q.tasks import async_task

def send_welcome_email(user_id):
    # ... email logic
    pass

# In your view
from django_q.tasks import async_task

async_task('apps.users.tasks.send_welcome_email', user_id)
```

### 5. Run worker

```bash
python manage.py qcluster
```

### 6. Add to Procfile

```
web: gunicorn PetCarePlus.wsgi:application
worker: python manage.py qcluster
```

## Advantages
✅ No Redis needed - uses PostgreSQL
✅ Simpler setup
✅ Built-in admin interface
✅ Perfect for low-to-medium traffic
✅ Scheduled tasks support

## Disadvantages
❌ Less scalable than Celery
❌ Not as feature-rich
❌ Database can become bottleneck at very high scale

## When to Use Django-Q
- Small to medium projects
- Budget constraints (free tier)
- Already using PostgreSQL
- < 1000 background tasks per hour

## When to Stick with Celery
- High-traffic applications
- Need advanced features (chains, chords, etc.)
- > 1000 tasks per hour
- Multiple worker types
## Compatibility Check (Specific to PetCarePlus)

### 1. Hosting Platform (Koyeb + Supabase)
*   **Database (Supabase)**: ✅ **Compatible**. Django-Q uses the Django ORM. Since you are using Supabase (PostgreSQL), it will work out of the box. No Redis required.
*   **Backend (Koyeb)**: ⚠️ **Requires Configuration**. Django-Q requires a persistent worker process (`python manage.py qcluster`).
    *   **Option A (Best for Free Tier)**: Run `gunicorn` (web) and `qcluster` (worker) in the **same container** using a supervisor script. This keeps you within the "1 Service" limit of many free tiers.
    *   **Option B**: Deploy a second service on Koyeb just for the worker. This might cost money or use up your free allowance.

### 2. Existing Task Compatibility
*   **Audited Tasks**:
    1.  `apps.users.tasks.send_email_task` (Simple async call) - ✅ **Compatible**
    2.  `apps.services.tasks.send_booking_confirmation_email_task` (Model retrieval + Email) - ✅ **Compatible**
    3.  `apps.services.tasks.send_booking_status_update_email_task` (Model retrieval + Email) - ✅ **Compatible**
    4.  `apps.rehoming.tasks.analyze_application_match` (Model retrieval + AI call + Update) - ✅ **Compatible**
*   **Verdict**: All current tasks are simple "fire-and-forget" or DB-updating tasks. They do not use complex Celery features (Chains, Chords, Groups) that would require a complex migration.

### 3. Migration Difficulty: Low
*   You only need to change the `@shared_task` decorator to a standard function and call it with `async_task()`.

## Recommended "Single Container" Startup Script (for Koyeb)

To run both Web and Worker on a single Koyeb instance, create `scripts/start_all.sh`:

```bash
#!/bin/bash

# Start Django-Q Cluster in background
python manage.py qcluster &

# Start Gunicorn (Web Server) in foreground
gunicorn PetCarePlus.wsgi:application --bind 0.0.0.0:8000
```
