[⬅️ Back to Main README](https://github.com/rockychowdhury/PetCarePlus-Django-React)

# PetCarePlus V2 API Documentation

This documentation details the REST API endpoints for the PetCarePlus V2 application.

**Base URL**: `/api/v1/`
**Authentication**: Bearer Token (JWT)
**Header**: `Authorization: Bearer <access_token>`

---

## 🔐 Auth & Accounts (`/api/v1/auth/`)

### Register User
- **URL**: `/api/v1/auth/register/`
- **Method**: `POST`
- **Auth Required**: No
- **Body**: `{ "email": "user@example.com", "password": "...", "first_name": "...", "last_name": "..." }`

### Login (Obtain Tokens)
- **URL**: `/api/v1/auth/token/`
- **Method**: `POST`
- **Auth Required**: No
- **Body**: `{ "email": "user@example.com", "password": "..." }`
- **Returns**: `{ "access": "...", "refresh": "..." }`

### Refresh Token
- **URL**: `/api/v1/auth/token/refresh/`
- **Method**: `POST`
- **Body**: `{ "refresh": "..." }`

### Get Current User Profile
- **URL**: `/api/v1/auth/me/`
- **Method**: `GET`
- **Auth Required**: Yes

---

## 🐾 Animals & Pets (`/api/v1/animals/`)

### List / Create Pets
- **URL**: `/api/v1/animals/pets/`
- **Method**: `GET` | `POST`
- **Auth Required**: Yes

### Retrieve / Update / Delete Pet
- **URL**: `/api/v1/animals/pets/<id>/`
- **Method**: `GET` | `PUT` | `PATCH` | `DELETE`
- **Auth Required**: Yes (Must be owner)

---

## 🏥 Providers (`/api/v1/providers/`)

### List Providers (with location filtering)
- **URL**: `/api/v1/providers/`
- **Method**: `GET`
- **Query Params**: `lat`, `lng`, `radius`, `category`
- **Auth Required**: No

### Get Provider Details
- **URL**: `/api/v1/providers/<id>/`
- **Method**: `GET`
- **Auth Required**: No

### Manage My Provider Profile
- **URL**: `/api/v1/providers/me/`
- **Method**: `GET` | `PUT`
- **Auth Required**: Yes (Must be Provider)

---

## 📅 Bookings (`/api/v1/bookings/`)

### Create Booking
- **URL**: `/api/v1/bookings/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**: `{ "provider": <id>, "pet": <id>, "start_time": "...", "end_time": "..." }`

### List My Bookings
- **URL**: `/api/v1/bookings/my-bookings/`
- **Method**: `GET`
- **Auth Required**: Yes

### Provider: Manage Bookings
- **URL**: `/api/v1/bookings/<id>/`
- **Method**: `PATCH`
- **Body**: `{ "status": "confirmed" | "completed" | "cancelled" }`

---

## 🤖 AI Assistant (`/api/v1/ai/`)

### Create/Start Session
- **URL**: `/api/v1/ai/sessions/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**: `{ "pet_id": <id> }`

### Send Message / Get AI Response
- **URL**: `/api/v1/ai/sessions/<id>/messages/`
- **Method**: `POST`
- **Body**: `{ "content": "My dog is vomiting, what should I do?" }`
- **Returns**: AI generated response content.

---

## 🏡 Rehoming (`/api/v1/rehoming/`)

### List Active Rehoming Ads
- **URL**: `/api/v1/rehoming/listings/`
- **Method**: `GET`
- **Auth Required**: No

### Create Rehoming Listing
- **URL**: `/api/v1/rehoming/listings/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**: `{ "pet": <id>, "reason": "Moving abroad", "requirements": "..." }`

### Submit Adoption Application
- **URL**: `/api/v1/rehoming/applications/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body**: `{ "listing": <id>, "message": "I have a big backyard..." }`

---

## 📚 Resources (`/api/v1/resources/`)

### Get Guidelines
- **URL**: `/api/v1/resources/guidelines/`
- **Method**: `GET`
- **Auth Required**: No

### Get Govt Resources
- **URL**: `/api/v1/resources/govt/`
- **Method**: `GET`
- **Auth Required**: No

---

## ⭐ Reviews (`/api/v1/reviews/`)

### Leave a Review
- **URL**: `/api/v1/reviews/`
- **Method**: `POST`
- **Auth Required**: Yes (Must have completed booking with provider)
- **Body**: `{ "booking": <id>, "rating": 5, "comment": "Great vet!" }`
