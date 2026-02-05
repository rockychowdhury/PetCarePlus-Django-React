# Project Architecture & Details

## Folder Structure

### Backend (`/backend`)
- `PetCarePlus/`: Main Django configuration (`settings.py`, `urls.py`).
- `apps/`: Modular Django apps.
  - `users/`: Auth, Custom User Model, Profiles.
  - `services/`: Providers, Services, Bookings, Reviews.
  - `rehoming/`: Pet listings, Adoption applications.
  - `admin_panel/`: Admin dashboard logic.
  - `notifications/`: Email & App notification logic.
- `Dockerfile`: Container definition for backend.
- `entrypoint.sh`: Startup script for migrations and Gunicorn.

### Frontend (`/frontend`)
- `src/`: Source code.
  - `components/`: Reusable React components.
  - `pages/`: Page views/Routes.
  - `context/`: React Context (Auth, Theme).
  - `hooks/`: Custom hooks (API, Queries).
  - `assets/`: Static images/icons.
- `tailwind.config.js`: Tailwind styling configuration.
- `vite.config.js`: Build configuration.

## Tech Stack Deep Dive

### Backend
- **Framework**: Django 4.x
- **API**: Django REST Framework (DRF)
- **Database**: PostgreSQL (Production), SQLite (Dev)
- **Async Tasks**: Celery 5.x + Redis
- **Authentication**: JWT (SimpleJWT)
- **Documentation**: Swagger/OpenAPI (configurable)

### Frontend
- **Core**: React 18, Vite
- **Styling**: Tailwind CSS, Framer Motion (Animations), Lucide React (Icons)
- **Data Fetching**: TanStack Query (React Query) v5
- **Forms**: React Hook Form + Zod
- **Maps**: React Leaflet

## Deployment Architecture
1. **Web Server**: Gunicorn serves the Django App behind Whitenoise (Static files).
2. **Worker**: Celery worker runs in parallel for background tasks (Email, Reports).
3. **Broker**: Redis (Upstash/Local) manages the task queue.
4. **Database**: PostgreSQL (Supabase/Local) stores relational data.
