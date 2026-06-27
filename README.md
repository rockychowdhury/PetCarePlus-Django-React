# PetCarePlus — Comprehensive Digital Animal Care Platform

<div align="center">
  <img src="https://i.ibb.co.com/rKLZFKLp/pcppewview.png" alt="PetCarePlus Banner" width="100%" />
</div>

<br />

## 📖 Overview

**PetCarePlus** is Bangladesh's first comprehensive digital ecosystem designed to bridge the gap between animal owners (both companion pets and farm livestock) and essential veterinary services. The platform offers AI-driven diagnostics, location-based provider discovery, vaccination scheduling, and a dedicated rehoming (adoption) module. 

Built with bilingual support (English and Bengali), it ensures accessibility for urban pet parents and rural farmers alike.

### 🚩 The Problem
In many developing regions, especially rural areas, access to timely veterinary care is limited. Pet owners and farmers often struggle to:
- Find verified, nearby veterinarians or clinics in emergencies.
- Get immediate preliminary advice for animal health issues.
- Keep track of complex vaccination schedules.
- Find a safe, reliable platform for pet adoption and rehoming without falling victim to scams.

### 💡 The Solution
PetCarePlus solves these issues by providing a centralized digital hub:
- **Location-Based Discovery:** Instantly find and book appointments with nearby vets and clinics using GPS.
- **AI Diagnostics:** Get 24/7 preliminary health assessments using an intelligent AI assistant before visiting a doctor.
- **Rehoming Module:** A dedicated, secure space to list and find animals for adoption.
- **Resource Center:** Access government guidelines, care routines, and vaccination trackers in both English and Bengali.

<br />

## 🔗 Live Link
- **Live Demo:** [Insert Live Link Here](#)
- **Promotional Video:** [Insert Video Link Here](#)

<br />

## 💻 Tech Stack

We used a modern, scalable tech stack to ensure high performance, security, and a premium user experience.

<div align="center">
  <table>
    <tr>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=py" width="48" height="48" alt="Python" />
        <br>Python
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=django" width="48" height="48" alt="Django" />
        <br>Django
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=postgres" width="48" height="48" alt="PostgreSQL" />
        <br>PostgreSQL
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=react" width="48" height="48" alt="React" />
        <br>React
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=tailwind" width="48" height="48" alt="Tailwind" />
        <br>Tailwind
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=vite" width="48" height="48" alt="Vite" />
        <br>Vite
      </td>
    </tr>
    <tr>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=redis" width="48" height="48" alt="Redis" />
        <br>Redis
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=docker" width="48" height="48" alt="Docker" />
        <br>Docker
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=git" width="48" height="48" alt="Git" />
        <br>Git
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=postman" width="48" height="48" alt="Postman" />
        <br>Postman
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=nginx" width="48" height="48" alt="Nginx" />
        <br>Nginx
      </td>
      <td align="center" width="96">
        <img src="https://skillicons.dev/icons?i=js" width="48" height="48" alt="JavaScript" />
        <br>JavaScript
      </td>
    </tr>
  </table>
</div>

<br />

## ✨ Feature List

### V2 Rebuild & Architectural Improvements
The V2 rebuild focused heavily on modernizing the tech stack, improving UX, and seamlessly merging V1 features (like Rehoming) into a unified, high-performance platform.

- **Complete UI/UX Overhaul:** Rebuilt with Tailwind CSS, Framer Motion, and Radix UI for a premium, accessible, and glassmorphic design.
- **Bilingual Architecture:** Deep integration of i18n supporting seamless toggling between English and Bengali without page reloads.
- **Optimized State Management:** Migrated to Zustand for global state and React Query for efficient server-state caching and data synchronization.
- **Enhanced Rehoming Integration:** The standalone V1 rehoming features were deeply integrated into the V2 core, allowing unified user accounts, shared location data, and a consistent UI.
- **Performance Fixes:** Eliminated layout shifts, fixed complex CSS overflow issues on mobile, and optimized component rendering cycles.

### Core Platform Features
- **🤖 AI Veterinary Assistant:** 24/7 chatbot powered by Google Gemini/GenAI for preliminary symptom checking and dietary advice.
- **🏥 Provider Discovery & Booking:** Search, filter, and book appointments with verified veterinarians and clinics based on GPS proximity.
- **🐾 Rehoming & Adoption Center:** Create detailed listings for pets needing a new home. Users can browse, filter, and safely contact current owners.
- **📚 Knowledge & Resource Hub:** Access localized government guidelines, vaccination schedules, and animal care articles.
- **⭐ Review & Rating System:** Leave verified reviews for providers to build community trust.
- **🔐 Secure Authentication:** JWT-based authentication with role-based access control (Pet Owners, Farmers, Providers, Admins).

<br />

## 🛠 Case Study: Challenges & Implementation

### 1. Complex State Management & Data Synchronization
**Challenge:** In V1, managing the state between the user's dashboard, booking forms, and the rehoming module became chaotic, leading to stale data and UI bugs.
**Solution:** In V2, we adopted **React Query** for all API interactions. This abstracted away loading/error states and provided automatic background refetching. We combined this with **Zustand** for lightweight UI state (like the active language or theme), completely eliminating prop-drilling and ensuring the UI is always perfectly synced with the Django backend.

### 2. Location-Based Provider Filtering
**Challenge:** Finding nearby vets required complex geospatial queries that were slow on the backend and difficult to parse on the frontend, especially in rural Bangladesh where GPS data can be noisy.
**Solution:** We implemented a custom location processing pipeline. The frontend securely requests the user's GPS coordinates, and the Django backend uses optimized distance calculations to return paginated results sorted by proximity. We also optimized the frontend location prompt to prevent UI blocking, adding a seamless modal flow for fetching GPS data.

### 3. Merging V1 Rehoming into V2 Core
**Challenge:** The V1 rehoming feature operated almost like a separate app with its own data flow. Integrating it into the V2 ecosystem without breaking existing user flows was difficult.
**Solution:** We refactored the Django models to use a unified `User` model, linking `RehomingListing` directly to the core accounts. On the frontend, we created modular, reusable UI components (like image galleries and contact modals) that could be shared between the Provider and Rehoming domains, ensuring a consistent and DRY user experience.

### 4. Bilingual Support (i18n) & UI Responsiveness
**Challenge:** Translating complex medical terms and ensuring the UI didn't break when switching to Bengali (which often requires more horizontal and vertical space than English).
**Solution:** We utilized a custom `useLanguage` hook. To handle UI overflows (especially in the Hero section and Data Tables), we implemented strict `max-w-[100vw]` constraints, dynamic text wrapping, and custom scrollbar handling. We systematically hunted down layout shifts caused by language toggling.

<br />

## 📁 Project Structure

```text
PetCarePlus/
├── backend/                  # Django REST API
│   ├── apps/                 # Modular Django apps (accounts, animals, providers, rehoming, etc.)
│   ├── common/               # Shared utilities and middlewares
│   ├── config/               # Core Django settings (base, dev, prod)
│   └── requirements.txt      # Python dependencies
└── frontend/                 # React + Vite Client
    ├── src/
    │   ├── api/              # Axios instances and React Query hooks
    │   ├── components/       # Reusable UI components (Radix + Tailwind)
    │   ├── pages/            # Page-level components (Home, Dashboard, Rehoming)
    │   ├── store/            # Zustand state stores
    │   └── utils/            # Helper functions
    └── package.json          # Node dependencies
```

<br />

## 📚 Documentation

For deep dives into the project's architecture, API, and deployment, please refer to the following documentation files:

- **[API Documentation](https://github.com/rockychowdhury/PetCarePlus-Django-React/blob/main/docs/api_docs.md)**: Detailed endpoints, request/response formats, and authentication.
- **[Database Schema](https://github.com/rockychowdhury/PetCarePlus-Django-React/blob/main/docs/database_schema.md)**: ERD explanation, models, and relations for the Django backend.
- **[V2 Architecture & Changes](https://github.com/rockychowdhury/PetCarePlus-Django-React/blob/main/docs/V2.md)**: In-depth breakdown of the migration from V1 to V2.

<br />

## 🤝 Contribution

Contributions, issues, and feature requests are welcome! 
Feel free to check the issues page if you want to contribute.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<br />

## 📬 Contact & Links

**[Rocky Chowdhury / Full Stack Developer]**  
Full-Stack Developer passionate about building impactful digital solutions.

- 🌐 **Portfolio:** [Rocky Chowdhury Portfolio](https://rockychowdhury.vercel.app/)
- 💼 **LinkedIn:** [Rocky Chowdhury](https://www.linkedin.com/in/rockychowdhury1/)
- ✉️ **Email:** [rockychowdhury055@gmail.com](mailto:[EMAIL_ADDRESS])

---
*If you find this project useful, please consider giving it a ⭐ on GitHub!*
