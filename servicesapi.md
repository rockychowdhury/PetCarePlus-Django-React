# Pet Services API Contract Documentation

## Overview
This document outlines the REST API endpoints needed for a comprehensive pet services marketplace platform.

---

## 1. Service Provider Management

### 1.1 List Service Providers
**GET** `/api/services/providers/`

**Purpose**: Browse and search all service providers with filtering capabilities

**Query Parameters**:
- `category` - Filter by service category (veterinary, foster, trainer, etc.)
- `species` - Filter by accepted species
- `city` - Filter by city
- `state` - Filter by state
- `lat` & `lng` - Coordinates for location-based search
- `radius` - Search radius in km
- `verification_status` - Filter by verified/pending/suspended
- `min_rating` - Minimum average rating
- `search` - Search in business name and description

**Response**:
```json
{
  "count": 45,
  "next": "url-to-next-page",
  "previous": null,
  "results": [
    {
      "id": 1,
      "business_name": "Happy Paws Veterinary Clinic",
      "category": "Veterinary",
      "city": "San Francisco",
      "state": "CA",
      "average_rating": 4.7,
      "review_count": 23,
      "verification_status": "verified",
      "primary_photo": "https://...",
      "starting_price": 45.00,
      "distance_km": 2.3
    }
  ]
}
```

**Reason**: Core discovery feature - users need to find services near them based on their pet's needs.

---

### 1.2 Get Provider Details
**GET** `/api/services/providers/{id}/`

**Purpose**: View complete information about a specific service provider

**Response**:
```json
{
  "id": 1,
  "business_name": "Happy Paws Veterinary Clinic",
  "category": "Veterinary",
  "description": "Full service description...",
  "phone": "+1234567890",
  "email": "contact@happypaws.com",
  "website": "https://happypaws.com",
  "address": {
    "line1": "123 Main St",
    "line2": "Suite 100",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94102",
    "coordinates": {
      "lat": 37.7749,
      "lng": -122.4194
    }
  },
  "verification_status": "verified",
  "license_number": "VET-12345",
  "average_rating": 4.7,
  "review_count": 23,
  "photos": [
    {
      "url": "https://...",
      "thumbnail": "https://...",
      "is_primary": true
    }
  ],
  "business_hours": [
    {
      "day": "Monday",
      "open_time": "09:00",
      "close_time": "18:00",
      "is_closed": false
    }
  ],
  "service_specific_details": {
    // Varies by category - see section 2
  }
}
```

**Reason**: Users need comprehensive details to make informed decisions before booking.

---

### 1.3 Create Provider Profile
**POST** `/api/services/providers/`

**Purpose**: Register as a new service provider (requires authentication)

**Payload**:
```json
{
  "business_name": "Happy Paws Veterinary Clinic",
  "category": "veterinary",
  "description": "500+ word description...",
  "phone": "+1234567890",
  "email": "contact@happypaws.com",
  "website": "https://happypaws.com",
  "address_line1": "123 Main St",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94102",
  "license_number": "VET-12345",
  "insurance_info": "Insurance details..."
}
```

**Response**: Same as GET details (status 201)

**Reason**: Service providers need to onboard and create their business profiles.

---

### 1.4 Update Provider Profile
**PATCH** `/api/services/providers/{id}/`

**Purpose**: Update existing provider information (owner only)

**Payload**: Partial update of any fields from creation

**Reason**: Providers need to keep their information current.

---

### 1.5 Upload Provider Photos
**POST** `/api/services/providers/{id}/media/`

**Purpose**: Add photos to provider profile

**Payload** (multipart/form-data):
```
file: [binary]
alt_text: "Waiting room photo"
is_primary: false
```

**Response**:
```json
{
  "id": 5,
  "file_url": "https://...",
  "thumbnail_url": "https://...",
  "is_primary": false,
  "alt_text": "Waiting room photo"
}
```

**Reason**: Visual content builds trust and helps users evaluate services.

---

## 2. Service-Specific Details

### 2.1 Veterinary Clinic Details
**GET** `/api/services/veterinary/{provider_id}/`

**Response**:
```json
{
  "clinic_type": "general",
  "services_offered": [
    {
      "id": 1,
      "name": "Wellness Exam",
      "description": "...",
      "base_price": 65.00
    }
  ],
  "species_treated": ["Dog", "Cat", "Bird"],
  "emergency_services": true,
  "amenities": ["On-site Lab", "Surgery Suite", "Pharmacy"],
  "pricing_info": "Detailed pricing text...",
  "is_open_now": true
}
```

**Reason**: Vet clinics have unique attributes like emergency services and specific medical offerings.

---

### 2.2 Foster Service Details
**GET** `/api/services/foster/{provider_id}/`

**Response**:
```json
{
  "capacity": 5,
  "current_count": 2,
  "current_availability": "available",
  "availability_percentage": 60,
  "species_accepted": ["Dog", "Cat"],
  "daily_rate": 35.00,
  "weekly_rate": 220.50,
  "monthly_rate": 850.00,
  "environment_details": {
    "indoor_space_sqft": 2000,
    "has_yard": true,
    "yard_fenced": true,
    "other_pets": ["2 dogs"]
  },
  "care_standards": {
    "feeding_schedule": "Twice daily",
    "exercise_routine": "3 walks per day"
  },
  "video_url": "https://youtube.com/..."
}
```

**Reason**: Foster homes need to showcase their environment and capacity for temporary pet care.

---

### 2.3 Trainer Service Details
**GET** `/api/services/trainer/{provider_id}/`

**Response**:
```json
{
  "specializations": [
    "Behavioral Issues",
    "Obedience Training"
  ],
  "primary_method": "positive_reinforcement",
  "training_philosophy": "Detailed philosophy...",
  "certifications": [
    {
      "name": "CPDT-KA",
      "issuer": "CCPDT",
      "year": 2020
    }
  ],
  "years_experience": 8,
  "species_trained": ["Dog", "Cat"],
  "offers_private_sessions": true,
  "offers_group_classes": true,
  "offers_virtual_training": false,
  "private_session_rate": 85.00,
  "group_class_rate": 35.00,
  "package_options": [
    {
      "name": "Basic Obedience Package",
      "sessions": 6,
      "price": 450.00,
      "description": "..."
    }
  ],
  "is_accepting_clients": true,
  "max_clients": 10,
  "current_client_count": 7
}
```

**Reason**: Training requires detailed credentials, methods, and flexible service options.

---

### 2.4 Groomer Service Details
**GET** `/api/services/groomer/{provider_id}/`

**Response**:
```json
{
  "salon_type": "both",
  "base_price": 45.00,
  "service_menu": [
    {
      "name": "Full Groom - Small Dog",
      "price": 45.00,
      "description": "Bath, haircut, nail trim"
    },
    {
      "name": "Full Groom - Large Dog",
      "price": 85.00,
      "description": "Bath, haircut, nail trim"
    }
  ],
  "species_accepted": ["Dog", "Cat"],
  "amenities": ["Hypoallergenic Products", "Calm Environment"]
}
```

**Reason**: Grooming has varied pricing by size/breed and mobile vs salon options.

---

### 2.5 Pet Sitter Details
**GET** `/api/services/sitter/{provider_id}/`

**Response**:
```json
{
  "offers_dog_walking": true,
  "offers_house_sitting": true,
  "offers_drop_in_visits": true,
  "walking_rate": 25.00,
  "house_sitting_rate": 75.00,
  "drop_in_rate": 20.00,
  "species_accepted": ["Dog", "Cat"],
  "years_experience": 5,
  "is_insured": true,
  "has_transport": true,
  "service_radius_km": 10
}
```

**Reason**: Sitters offer multiple service types with different rates and geographic limits.

---

## 3. Booking Management

### 3.1 Create Booking
**POST** `/api/services/bookings/`

**Purpose**: Book a service appointment

**Payload**:
```json
{
  "provider": 1,
  "pet": 5,
  "service_option": 3,
  "booking_type": "standard",
  "booking_date": "2026-02-15",
  "booking_time": "14:00",
  "start_datetime": "2026-02-15T14:00:00Z",
  "end_datetime": "2026-02-15T15:00:00Z",
  "special_requirements": "Pet is nervous around loud noises"
}
```

**Response**:
```json
{
  "id": 123,
  "provider": {
    "id": 1,
    "business_name": "Happy Paws"
  },
  "pet": {
    "id": 5,
    "name": "Max"
  },
  "booking_date": "2026-02-15",
  "booking_time": "14:00",
  "status": "pending",
  "agreed_price": 65.00,
  "payment_status": "pending",
  "created_at": "2026-01-31T10:00:00Z"
}
```

**Reason**: Core transaction - users need to schedule services for their pets.

---

### 3.2 List User Bookings
**GET** `/api/services/bookings/`

**Purpose**: View user's booking history and upcoming appointments

**Query Parameters**:
- `status` - Filter by pending/confirmed/completed/cancelled
- `provider` - Filter by specific provider
- `pet` - Filter by specific pet
- `start_date` - Filter bookings after date
- `end_date` - Filter bookings before date

**Response**:
```json
{
  "results": [
    {
      "id": 123,
      "provider": {
        "id": 1,
        "business_name": "Happy Paws",
        "photo": "https://..."
      },
      "pet": {
        "id": 5,
        "name": "Max",
        "photo": "https://..."
      },
      "booking_date": "2026-02-15",
      "booking_time": "14:00",
      "status": "confirmed",
      "agreed_price": 65.00,
      "payment_status": "paid"
    }
  ]
}
```

**Reason**: Users need to track their appointments and service history.

---

### 3.3 Update Booking Status
**PATCH** `/api/services/bookings/{id}/`

**Purpose**: Update booking (client can cancel, provider can confirm/complete)

**Payload**:
```json
{
  "status": "confirmed",
  "cancellation_reason": "Client requested reschedule"
}
```

**Reason**: Both parties need to manage booking lifecycle.

---

### 3.4 Check Provider Availability
**GET** `/api/services/providers/{id}/availability/`

**Purpose**: Get available time slots for booking

**Query Parameters**:
- `date` - Check specific date
- `start_date` - Check date range start
- `end_date` - Check date range end

**Response**:
```json
{
  "date": "2026-02-15",
  "is_open": true,
  "business_hours": {
    "open": "09:00",
    "close": "18:00"
  },
  "blocked_times": [
    {
      "start": "12:00",
      "end": "13:00",
      "reason": "Lunch break"
    }
  ],
  "existing_bookings": [
    {
      "start": "14:00",
      "end": "15:00"
    }
  ],
  "available_slots": [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "13:00", "13:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ]
}
```

**Reason**: Prevents double-booking and shows users when they can schedule.

---

## 4. Reviews & Ratings

### 4.1 Create Review
**POST** `/api/services/reviews/`

**Purpose**: Submit review after service completion

**Payload**:
```json
{
  "provider": 1,
  "rating_overall": 5,
  "rating_communication": 5,
  "rating_cleanliness": 4,
  "rating_quality": 5,
  "rating_value": 4,
  "review_text": "200+ word detailed review...",
  "photo_url": "https://...",
  "service_option": 3
}
```

**Response**: Created review object (status 201)

**Reason**: Reviews build trust and help users make decisions.

---

### 4.2 List Provider Reviews
**GET** `/api/services/providers/{id}/reviews/`

**Purpose**: View all reviews for a provider

**Query Parameters**:
- `min_rating` - Filter by minimum rating
- `verified_only` - Show only verified client reviews

**Response**:
```json
{
  "average_rating": 4.7,
  "rating_breakdown": {
    "5_star": 15,
    "4_star": 6,
    "3_star": 2,
    "2_star": 0,
    "1_star": 0
  },
  "results": [
    {
      "id": 45,
      "reviewer": {
        "name": "John D.",
        "photo": "https://..."
      },
      "rating_overall": 5,
      "rating_communication": 5,
      "rating_cleanliness": 4,
      "rating_quality": 5,
      "rating_value": 4,
      "review_text": "Excellent service...",
      "photo_url": "https://...",
      "verified_client": true,
      "provider_response": "Thank you for the kind words!",
      "created_at": "2026-01-20T10:00:00Z"
    }
  ]
}
```

**Reason**: Displays social proof and detailed feedback for decision-making.

---

### 4.3 Provider Response to Review
**POST** `/api/services/reviews/{id}/respond/`

**Purpose**: Allow provider to respond to reviews

**Payload**:
```json
{
  "provider_response": "Thank you for your feedback! We're glad Max enjoyed his visit."
}
```

**Reason**: Providers can engage with feedback and demonstrate customer service.

---

## 5. Search & Discovery

### 5.1 Search Services
**GET** `/api/services/search/`

**Purpose**: Unified search across all service types

**Query Parameters**:
- `q` - Search query (business name, description, services)
- `category` - Filter by category
- `lat` & `lng` - User location
- `radius` - Search radius
- `species` - Filter by accepted species
- `price_min` / `price_max` - Price range
- `available_now` - Boolean for immediate availability
- `emergency_only` - For urgent vet services

**Response**: Same as List Providers with relevance scoring

**Reason**: Users need flexible search to find services matching multiple criteria.

---

### 5.2 Get Service Categories
**GET** `/api/services/categories/`

**Purpose**: List all available service categories

**Response**:
```json
[
  {
    "id": 1,
    "name": "Veterinary",
    "slug": "veterinary",
    "description": "Medical care for pets",
    "icon_name": "stethoscope",
    "provider_count": 45
  },
  {
    "id": 2,
    "name": "Foster",
    "slug": "foster",
    "description": "Temporary home care",
    "icon_name": "home",
    "provider_count": 23
  }
]
```

**Reason**: Navigation and filtering foundation for the entire platform.

---

### 5.3 Get Species Options
**GET** `/api/services/species/`

**Purpose**: List all supported species

**Response**:
```json
[
  {"id": 1, "name": "Dog", "slug": "dog"},
  {"id": 2, "name": "Cat", "slug": "cat"},
  {"id": 3, "name": "Bird", "slug": "bird"}
]
```

**Reason**: Filtering by pet type is essential for relevant results.

---

## 6. Provider Dashboard

### 6.1 Get Provider Statistics
**GET** `/api/services/providers/{id}/stats/`

**Purpose**: Dashboard metrics for providers

**Response**:
```json
{
  "total_bookings": 156,
  "pending_bookings": 3,
  "completed_bookings": 142,
  "revenue_current_month": 4850.00,
  "revenue_last_month": 5200.00,
  "average_rating": 4.7,
  "total_reviews": 23,
  "profile_views_this_week": 87,
  "upcoming_appointments": [
    {
      "date": "2026-02-01",
      "time": "10:00",
      "pet_name": "Buddy",
      "client_name": "Sarah M."
    }
  ]
}
```

**Reason**: Providers need business insights and quick overview of operations.

---

### 6.2 Manage Availability Blocks
**POST** `/api/services/providers/{id}/availability-blocks/`

**Purpose**: Block out unavailable times

**Payload**:
```json
{
  "block_date": "2026-02-10",
  "start_time": "12:00",
  "end_time": "13:00",
  "is_all_day": false,
  "is_recurring": false,
  "reason": "Lunch break"
}
```

**Reason**: Providers need control over their schedule to prevent overbooking.

---

## 7. Administrative

### 7.1 Verify Provider
**POST** `/api/admin/services/providers/{id}/verify/`

**Purpose**: Admin verification of provider credentials

**Payload**:
```json
{
  "verification_status": "verified",
  "notes": "License verified with state board"
}
```

**Reason**: Platform quality control and user safety.

---

## Summary

**Total Endpoints**: 25 core endpoints

**Key Principles**:
1. **RESTful design** - Standard HTTP methods and status codes
2. **Filtering & pagination** - All list endpoints support query parameters
3. **Nested resources** - Service-specific details under provider context
4. **Role-based access** - Separate permissions for clients, providers, admins
5. **Real-time availability** - Booking system prevents conflicts
6. **Trust & safety** - Verification, reviews, and detailed information

This API contract supports a complete marketplace for pet services with discovery, booking, reviews, and management capabilities.