# PetCarePlus (Django + React Application)

PetCarePlus is a comprehensive platform connecting pet owners with service providers (vets, sitters, dog walkers) and facilitating sustainable pet rehoming/fostering. It features a modern SPA frontend built with React (Vite) and a robust Django REST Framework backend.

**Live Demo:**
- **[Vercel (Primary)](https://petcareplus-five.vercel.app/)**
- [Netlify (Alternative)](https://petcarepp.netlify.app/)

---

## 🎯 Problem & Solution
**The Problem**: Pet owners often struggle to find trusted local care providers or navigate the complex, often heartbreaking process of rehoming a pet. Existing platforms are often fragmented, lacking verified providers or secure adoption processes.

**The Solution**: PetCarePlus unifies these needs into a single, secure ecosystem. It offers a verified marketplace for pet services and a dedicated, empathy-driven interface for rehoming pets, ensuring safety and trust through rigorous identity verification and AI-assisted matching.

---

## 🚀 Key Features

### 🔐 Secure Authentication & Trust
- **Cookie-Based JWT**: HttpOnly cookies for secure, XSS-resistant authentication with automatic token rotation.
- **Identity Verification**: Multi-step verification for Service Providers (Documents, Email, Phone) to ensure platform safety.

### 📍 Geo-Location Search
- **Proximity Matching**: Find Vets, Groomers, and Sitters near you using Haversine distance calculations.
- **PostGIS-like Logic**: Efficient spatial filtering to show only relevant, local results.

### 🤖 AI-Powered Assistance (Google Gemini)
- **Smart Rehoming Matches**: Integrated **Google Gemini Pro** to analyze adoption applications and compatibility with listed pets.
- **Content Generation**: AI assistance for writing compelling pet profiles and bio descriptions.

### ⚡ High-Performance Background Tasks
- **Celery & Redis**: Asynchronous processing for heavy tasks to keep the UI snappy.
- **Real-time Notifications**: Background handling of Email delivery (Welcome emails, Booking confirmations) and in-app alerts.

### 🏥 Comprehensive Service Management
- **Provider Dashboard**: Dedicated portal for providers to manage availability, bookings, and earnings.
- **Booking System**: Full booking lifecycle management (Request -> Confirm -> Complete -> Review).

---

## 🛠 Tech Stack

### Backend
- **Framework**: Django 5.x & Django REST Framework (DRF)
- **Authentication**: `SimpleJWT` with HttpOnly Cookies
- **Database**: PostgreSQL
- **Async Queue**: Celery 5.x + Redis 5.x
- **AI/ML**: Google Generative AI (Gemini)
- **Utilities**: `Pillow` (Image Processing), `django-filter`

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS (Custom "Sage & Stone" Theme)
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM 6
- **Maps**: Leaflet / React-Leaflet
- **Data Viz**: Recharts (Analytics & Stats)
- **Forms**: React Hook Form + Zod Validation

### DevOps & Infrastructure
- **Containerization**: Docker & Docker Compose
- **Server**: Gunicorn + Whitenoise (Static Files)
- **CI/CD**: GitHub Actions (planned)
- **Hosting**:
  - **Frontend**: Vercel / Netlify
  - **Backend**: Koyeb (Docker) / Render
  - **DB/Redis**: Supabase / Upstash

---

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
   # Make sure Redis is running for Celery
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
