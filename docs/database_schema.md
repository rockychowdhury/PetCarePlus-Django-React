# Database Schema

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    User ||--o{ Pet : owns
    User ||--o{ Booking : makes
    User ||--o{ Review : writes
    User ||--|| ServiceProvider : "is a"
    
    ServiceProvider ||--o{ ServiceOption : offers
    ServiceProvider ||--o{ BlockedSlot : manages
    
    Pet ||--o{ AdoptionApplication : receives
    
    Booking }|--|| ServiceOption : "for"
    Booking ||--o{ Review : "has"

    User {
        uuid id
        string email
        string first_name
        string last_name
        string role "owner|provider|admin"
        boolean is_verified
    }

    ServiceProvider {
        uuid id
        uuid user_id
        string business_name
        string category "vet|sitter|groomer"
        text bio
        boolean verified
    }

    Pet {
        uuid id
        uuid owner_id
        string name
        string species
        string breed
        string status "active|adopted"
    }

    ServiceOption {
        uuid id
        uuid provider_id
        string name
        decimal price
        duration duration
    }

    Booking {
        uuid id
        uuid user_id
        uuid provider_id
        uuid service_id
        datetime start_time
        string status "pending|confirmed|completed"
    }
```

## Core Models

### 1. Users (`apps.users`)
- **User**: Custom user model extending AbstractUser. Handles auth and basic profile data.
- **RoleRequest**: Stores requests for users upgrading to 'Provider' status.

### 2. Services (`apps.services`)
- **ServiceProvider**: Profile for vets, sitters, etc. Linked 1-to-1 with User.
- **ServiceOption**: Specific services offered by a provider (e.g., "Dog Walking - 30m").
- **Booking**: Central record of service appointments.
- **Review**: Ratings and feedback for completed bookings.

### 3. Pets & Rehoming (`apps.pets`, `apps.rehoming`)
- **Pet**: Profile of a pet. Can be owned by a user or listed for adoption.
- **AdoptionApplication**: Request from a user to adopt a specific pet.

### 4. Admin (`apps.admin_panel`)
- **UserReport**: Reports filed against users or content for admin review.
