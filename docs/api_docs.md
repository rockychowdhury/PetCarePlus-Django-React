# API Documentation

The PetCarePlus API is built with Django REST Framework. The base URL for all API requests is `/api/`.

## Authentication
**Header**: `Authorization: Bearer <access_token>`

- `POST /api/user/register/`: Register a new user.
- `POST /api/user/login/`: Login and retrieve JWT tokens.
- `POST /api/user/token/refresh/`: Refresh access token.
- `POST /api/user/verify-email/`: Verify email address with OTP/Link.

## Users
- `GET /api/user/profile`: Retrieve current user profile.
- `PATCH /api/user/profile`: Update user profile.
- `GET /api/user/pets/`: List current user's pets.
- `POST /api/user/pets/`: Add a new pet.

## Services (Providers)
- `GET /api/services/providers/`: List all service providers/listings.
  - **Filters**: `category`, `search`, `ordering`, `location` (lat,lng,radius).
- `GET /api/services/providers/{id}/`: Get provider details.
- `POST /api/services/bookings/`: Create a booking request.
- `GET /api/services/bookings/`: List user's bookings.

## Pet Rehoming
- `GET /api/rehoming/pets/`: List adoptable pets.
- `GET /api/rehoming/applications/`: List adoption applications.
- `POST /api/rehoming/applications/`: Submit an adoption application.

## Admin Panel (Admin Only)
- `GET /api/admin-panel/users/`: Manage users.
- `GET /api/admin-panel/stats/`: Retrieve analytics data.
- `POST /api/admin-panel/users/{id}/ban/`: Ban a user.

## Health Check
- `GET /`: Returns `{"message": "Server is Healthy"}`.
