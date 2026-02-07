# PetCarePlus API Documentation

This documentation details the REST API endpoints for the PetCarePlus application.

**Base URL**: `/api/`
**Authentication**: Bearer Token (JWT)
**Header**: `Authorization: Bearer <access_token>`

---

## 🔐 Authentication

### Register User
Create a new user account.
- **URL**: `/api/user/register/`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe",
  "is_service_provider": false
}
```

**Response (201 Created)**
```json
{
  "message": "User created successfully. Please check your email for verification code.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

### Login
Obtain access and refresh tokens.
- **URL**: `/api/user/token/`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK)**
```json
{
  "refresh": "eyJ0eXAiOiJK...",
  "access": "eyJ0eXAiOiJK...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "avatar": "http://..."
  }
}
```

### Refresh Token
Get a new access token using a refresh token.
- **URL**: `/api/user/token/refresh/`
- **Method**: `POST`

**Request Body**
```json
{
  "refresh": "eyJ0eXAiOiJK..."
}
```

**Response (200 OK)**
```json
{
  "access": "eyJ0eXAiOiJK...",
  "refresh": "eyJ0eXAiOiJK..."
}
```

---

## 👤 User Profile

### Get Profile
Retrieve the currently authenticated user's profile.
- **URL**: `/api/user/`
- **Method**: `GET`

**Response (200 OK)**
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "1234567890",
  "location_city": "New York",
  "location_state": "NY",
  "location_country": "USA",
  "role": "user",
  "profile_is_complete": true
}
```

### Update Profile
Update user details.
- **URL**: `/api/user/`
- **Method**: `PATCH`

**Request Body**
```json
{
  "first_name": "Johnny",
  "phone_number": "0987654321"
}
```

---

## 🐾 Pets

### List Pets
Get all pets belonging to the user.
- **URL**: `/api/user/pets/`
- **Method**: `GET`

**Response (200 OK)**
```json
{
  "count": 1,
  "results": [
    {
      "id": 101,
      "name": "Buddy",
      "species": "Dog",
      "breed": "Golden Retriever",
      "age": 3,
      "gender": "Male",
      "weight": 25.5,
      "photo_url": "http://..."
    }
  ]
}
```

### Add Pet
- **URL**: `/api/user/pets/`
- **Method**: `POST`

**Request Body**
```json
{
  "name": "Buddy",
  "species": "Dog",
  "breed": "Golden Retriever",
  "date_of_birth": "2020-01-01",
  "gender": "Male"
}
```

---

## 🏥 Services & Providers

### List Service Providers
Search and filter service providers.
- **URL**: `/api/services/providers/`
- **Method**: `GET`
- **Query Params**: 
  - `search`: Name or keyword
  - `category`: `veterinary`, `groomer`, `petsitter`, `trainer`, `foster`
  - `nearby`: `true` (uses user location)

**Response (200 OK)**
```json
{
  "count": 5,
  "results": [
    {
      "id": 50,
      "business_name": "Happy Paws Grooming",
      "category": "groomer",
      "rating": 4.8,
      "review_count": 120,
      "location": "Downtown, NY",
      "is_verified": true,
      "avatar": "http://..."
    }
  ]
}
```

### Get Provider Details
- **URL**: `/api/services/providers/{id}/`
- **Method**: `GET`

**Response (200 OK)**
```json
{
  "id": 50,
  "business_name": "Happy Paws Grooming",
  "description": "Full service grooming...",
  "services": [
    { "name": "Full Groom", "price": 50.00 }
  ],
  "availability": {
    "monday": "09:00-17:00",
    "tuesday": "09:00-17:00"
  },
  "reviews": [...]
}
```

### Create Booking
- **URL**: `/api/services/bookings/`
- **Method**: `POST`

**Request Body**
```json
{
  "provider": 50,
  "pet": 101,
  "service_type": "standard",
  "start_time": "2024-03-10T10:00:00Z",
  "end_time": "2024-03-10T12:00:00Z",
  "notes": "Please use hypoallergenic shampoo"
}
```

---

## 🏡 Rehoming (Adoption)

### List Adoption Listings
- **URL**: `/api/rehoming/listings/`
- **Method**: `GET`
- **Query Params**: `species`, `gender`, `age_min`, `age_max`

**Response (200 OK)**
```json
{
  "results": [
    {
      "id": 200,
      "pet_name": "Luna",
      "species": "Cat",
      "location": "Brooklyn, NY",
      "published_at": "2024-02-15T..."
    }
  ]
}
```

### Submit Adoption Application
- **URL**: `/api/rehoming/applications/`
- **Method**: `POST`

**Request Body**
```json
{
  "listing": 200,
  "message": "We have a large home and experience with cats...",
  "phone_number": "1234567890"
}
```

---

## 🛡️ Admin Panel

All admin endpoints require `is_staff=true` or Admin role.

### List Users
- **URL**: `/api/admin-panel/users/`
- **Method**: `GET`

### Manage Role Requests
- **URL**: `/api/admin-panel/role-requests/`
- **Method**: `GET` (List), `POST` (Approve/Reject)

### Moderation Logs
- **URL**: `/api/admin-panel/logs/`
- **Method**: `GET`
