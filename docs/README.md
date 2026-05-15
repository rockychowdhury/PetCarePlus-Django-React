# PetCarePlus (Django + React Application)

PetCarePlus is a premium, full-stack ecosystem designed to connect pet owners with verified service providers and facilitate ethical pet rehoming. Built with a focus on trust, performance, and modern UX, it simplifies the complex journey of pet care management.

---

## 🎯 Problem & Solution
**The Problem**: Finding trusted local pet care (vets, sitters, groomers) is often a fragmented experience, and rehoming pets can be a stressful, unverified process. Existing solutions lack integrated security, real-time tracking, and verified provider networks.

**The Solution**: PetCarePlus provides a unified, secure platform. It combines a verified service marketplace with a dedicated, AI-assisted rehoming interface, ensuring every pet finds the care and home they deserve through identity verification and proximity-based matching.

---

## 🛠 Tech Stack

| Category | Tools |
| :--- | :--- |
| **Backend** | ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) ![Django](https://img.shields.io/badge/django-%23092E20.svg?style=for-the-badge&logo=django&logoColor=white) ![DRF](https://img.shields.io/badge/django%20rest-ff1709?style=for-the-badge&logo=django&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) |
| **Frontend** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![React Query](https://img.shields.io/badge/-React%20Query-FF4154?style=for-the-badge&logo=react-query&logoColor=white) |
| **Async Tasks** | ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white) ![Celery](https://img.shields.io/badge/celery-%2337814A.svg?style=for-the-badge&logo=celery&logoColor=white) |
| **AI/ML** | ![Google Gemini](https://img.shields.io/badge/google%20gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white) |
| **DevOps** | ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white) ![GitHub Actions](https://img.shields.io/badge/github%20actions-%232088FF.svg?style=for-the-badge&logo=github-actions&logoColor=white) |

---

## 🚀 Key Features

### 🔐 Secure Authentication & Trust
- **HttpOnly Cookie JWT**: Secure, XSS-resistant authentication with automatic token rotation.
- **Provider Verification**: Multi-step identity verification (Documents, Email, Phone) to ensure platform safety.

### 📍 Proximity-Based Discovery
- **Geo-Search**: Find Vets, Groomers, and Sitters near you using optimized Haversine distance calculations.
- **Interactive Maps**: Visual discovery of local providers using React-Leaflet.

### 🤖 AI-Powered Assistance
- **Smart Rehoming**: Integrated **Google Gemini Pro** to analyze adoption applications and compatibility.
- **Pet Profiles**: AI assistance for writing compelling pet descriptions and bios.

### 💳 Transactional Excellence
- **Payment Gateway**: Integrated **SSLCommerz** (Sandbox) for secure, seamless booking payments.
- **Responsive Dashboard**: Mobile-first portal for managing bookings, earnings, and availability.

### ⚡ Performance & Scale
- **Background Tasks**: Celery/Redis for asynchronous email delivery and real-time alerts.
- **Data Analytics**: Interactive charts for provider earnings and visitor trends.

---

## 📦 Installation & Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL & Redis (Local or Cloud)

### 2. Backend Setup
```bash
# Navigate and Setup Environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Dependencies
pip install -r requirements.txt

# Configure Environment Variables
cp .env.example .env
```
> [!IMPORTANT]
> You **MUST** update the following keys in `.env`:
> - `SECRET_KEY`: Django secret key.
> - `GOOGLE_API_KEY`: For Gemini AI features.
> - `SSLCOMMERZ_STORE_ID` & `SSLCOMMERZ_STORE_PASSWORD`: For payment features.
> - `DATABASE_URL` / `SQL_PORT`: Database connection details.

```bash
# Initialize Database
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup
```bash
# Navigate and Install
cd frontend
npm install

# Start Development Server
npm run dev
```

---

## 📖 Documentation
- [Features Overview](https://github.com/rockychowdhury/PetCarePlus-Django-React/blob/main/docs/features.md) - Platform capabilities.
- [API Documentation](https://github.com/rockychowdhury/PetCarePlus-Django-React/blob/main/docs/api_docs.md) - REST API Endpoints.
- [Database Schema](https://github.com/rockychowdhury/PetCarePlus-Django-React/blob/main/docs/database_schema.md) - Models & Relationships.
- [Project Architecture](https://github.com/rockychowdhury/PetCarePlus-Django-React/blob/main/docs/project_details.md) - Code structure.

---
*Built by Rocky Chowdhury*
