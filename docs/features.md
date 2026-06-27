[⬅️ Back to Main README](https://github.com/rockychowdhury/PetCarePlus-Django-React)

# PetCarePlus V2 Features & Flow

## 👤 Unified User Ecosystem
- **Seamless Roles**: A single user account can act as both a pet owner and a service provider without needing to manage multiple logins.
- **Bilingual Interface**: Full i18n support allows users to toggle between English and Bengali instantly without page reloads, increasing accessibility for rural users.
- **Secure Authentication**: JWT-based authentication ensuring secure, stateless sessions across the React frontend and Django API.

## 🤖 AI Veterinary Assistant
- **24/7 Triage**: Integrated with Google GenAI (Gemini) to provide instant preliminary advice for pet health issues.
- **Context-Aware**: The AI assistant knows which pet the user is asking about, utilizing the pet's age, species, and breed to give tailored advice.
- **Emergency Escalation**: The AI is programmed to identify critical symptoms and immediately suggest booking nearby verified vets.

## 🏥 Provider Discovery & Booking
- **Geo-Location Search**: Uses spatial calculations (Haversine/PostGIS) to find and sort veterinarians, groomers, and shelters by distance.
- **Detailed Profiles**: Providers have rich profiles detailing their services, business hours, verification badges, and user reviews.
- **Integrated Booking**: Direct appointment booking system with real-time status tracking (Pending, Confirmed, Completed, Cancelled).

## 🐾 Pet Rehoming & Adoption
- **Centralized Hub**: A dedicated, secure platform to list pets for adoption or browse available animals.
- **Detailed Listings**: Ads include comprehensive behavioral and medical history linked directly to the animal's core profile.
- **Application System**: Potential adopters submit detailed applications directly through the platform, allowing current owners to screen candidates safely.

## 📚 Knowledge & Resource Center
- **Government Guidelines**: Direct access to local agricultural and veterinary laws and guidelines.
- **Vaccination Trackers**: Species-specific vaccination schedules and requirements to help owners stay on track.

## ⚙️ Technical Architecture (V2)
- **State Management**: Zustand handles global UI state while React Query manages complex server-state caching, automatic refetching, and background synchronization.
- **UI/UX Overhaul**: Built using a modern glassmorphic design system with Tailwind CSS, Framer Motion animations, and Radix UI primitives for full accessibility.
- **Modular Django Backend**: The API is split into highly cohesive, decoupled apps (`accounts`, `animals`, `providers`, `bookings`, `reviews`, `ai_assistant`, `rehoming`, `notifications`, `locations`, `resources`), making the codebase highly maintainable.
