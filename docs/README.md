# PetCarePlus (Django + React Application)

PetCarePlus is a comprehensive platform connecting pet owners with service providers (vets, sitters, dog walkers) and facilitating pet rehoming/fostering. It features a modern SPA frontend built with React (Vite) and a robust Django REST Framework backend.

**Live Demo:**
- **[Vercel (Primary)](https://petcareplus-five.vercel.app/)**
- [Netlify (Alternative)](https://petcarepp.netlify.app/)

## 🚀 Key Features
- **User Authentication**: Secure JWT-based auth with email verification.
- **Service Booking**: Find and book local vets, sitters, and groomers.
- **Pet Rehoming**: Intelligent matching system for adopting/fostering pets.
- **Service Provider Dashboard**: Tools for providers to manage bookings and availability.
- **Admin Panel**: Full verification and management suite for platform admins.
- **Real-time Notifications**: Email and In-App updates (powered by Celery & Redis).

## 🛠 Tech Stack & Hosting
### Backend
- **Framework**: Django 4.x & Django REST Framework
- **Database**: PostgreSQL (Supabase)
- **Async Task Queue**: Celery + Redis (Upstash)
- **Hosting**: Koyeb (Docker Container)
- **Deployment**: Gunicorn + Whitenoise

### Frontend
- **Framework**: React 18 + Vite
- **Hosting**: Vercel / Netlify
- **Styling**: TailwindCSS (V2 "Sage & Stone" Theme)
- **State Management**: TanStack Query (React Query)
- **Maps**: Leaflet / React-Leaflet
- **Charts**: Recharts

## 📦 Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- Redis

### Backend Setup
1. Navigate to `/backend`:
   ```bash
   cd backend
   ```
2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure `.env` (Copy from `.env.example`).
5. Run migrations:
   ```bash
   python manage.py migrate
   ```
6. Start server:
   ```bash
   python manage.py runserver
   ```
   
### Frontend Setup
1. Navigate to `/frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

## 📖 Documentation
- [Features Overview](features.md) - Detailed breakdown of platform capabilities.
- [API Documentation](api_docs.md) - Endpoints and Usage.
- [Database Schema](database_schema.md) - Models and Relationships.
- [Project Architecture](project_details.md) - Deep dive into code structure.

## 🤝 Contributing
1. Fork the repo
2. Create feature branch
3. Submit PR

---
*Built by Rocky Chowdhury*
