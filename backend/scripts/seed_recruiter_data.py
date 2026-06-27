import os
import sys
import django
from django.utils import timezone
from datetime import timedelta
import random

# Setup Django
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from apps.accounts.models import User
from apps.providers.models import ServiceProvider
from apps.rehoming.models import RehomingListing, RehomingApplication
from apps.animals.models import AnimalType
from apps.bookings.models import Booking
from apps.reviews.models import Review

def run():
    print("Seeding recruiter data...")

    # 1. Create 3 Users
    print("Creating users...")
    users_data = [
        {"email": "farmer@pcp.com", "full_name": "Rahim Farmer", "role": User.Role.FARMER},
        {"email": "owner@pcp.com", "full_name": "Karim Owner", "role": User.Role.PET_OWNER},
        {"email": "provider@pcp.com", "full_name": "Dr. Vet Provider", "role": User.Role.PROVIDER},
    ]

    users = {}
    for data in users_data:
        user, created = User.objects.get_or_create(email=data["email"])
        user.set_password("PetCarePlus")
        user.full_name = data["full_name"]
        user.role = data["role"]
        user.photo_url = "https://i.ibb.co.com/5WQC4491/favicon.png"
        user.district = "Dhaka"
        user.save()
        users[data["role"]] = user
    
    farmer = users[User.Role.FARMER]
    owner = users[User.Role.PET_OWNER]
    provider_user = users[User.Role.PROVIDER]

    # Create ServiceProvider profile for vet
    print("Creating ServiceProvider...")
    provider, _ = ServiceProvider.objects.get_or_create(user=provider_user)
    provider.business_name = "Dhaka Central Vet Clinic"
    provider.provider_type = "vet"
    provider.is_verified = True
    provider.profile_image_url = "https://i.ibb.co.com/5WQC4491/favicon.png"
    
    try:
        from apps.locations.models import District
        dhaka = District.objects.filter(name_en__icontains='Dhaka').first()
        if dhaka:
            provider.district = dhaka
    except Exception:
        pass
        
    provider.save()

    # Get AnimalType for Dog and Cat (assuming they exist from seed_animals)
    cat_type, _ = AnimalType.objects.get_or_create(slug='cat', defaults={'name_en': 'Cat', 'name_bn': 'Cat', 'category': 'companion', 'supports_rehoming': True})
    dog_type, _ = AnimalType.objects.get_or_create(slug='dog', defaults={'name_en': 'Dog', 'name_bn': 'Dog', 'category': 'companion', 'supports_rehoming': True})

    # 2. Create Rehoming Posts
    images = [
        "https://i.ibb.co.com/tPXRYG11/pexels-cibelebergamim-32623335.jpg",
        "https://i.ibb.co.com/1YtdNsjf/pexels-nanamusic-31566539.jpg",
        "https://i.ibb.co.com/tw5WNjRK/pexels-christopher-welsch-leveroni-2150186467-31115675.jpg",
        "https://i.ibb.co.com/dJPVLF5g/pexels-cong-h-613161-1404819.jpg",
        "https://i.ibb.co.com/pvXLCSW3/pexels-francesco-ungaro-96938.jpg",
        "https://i.ibb.co.com/99R84SQc/images.jpg",
        "https://i.ibb.co.com/Lz5tJbTY/pexels-tranmautritam-2061057.jpg",
        "https://i.ibb.co.com/qXw1vkr/loan-7-AIDE8-Prv-A0-unsplash.jpg"
    ]

    print("Creating Rehoming Listings...")
    RehomingListing.objects.filter(owner__in=[owner, farmer]).delete()
    
    listings = []
    # 6 from owner
    for i in range(6):
        listing = RehomingListing.objects.create(
            owner=owner,
            animal_type=random.choice([cat_type, dog_type]),
            pet_name=f"Pet {i+1}",
            breed="Mixed",
            age=2.5,
            photo_url=images[i],
            district="Dhaka",
            reason="Moving out of country",
            status=RehomingListing.Status.ACTIVE,
            policy_accepted=True
        )
        listings.append(listing)

    # 2 from farmer
    for i in range(2):
        listing = RehomingListing.objects.create(
            owner=farmer,
            animal_type=random.choice([cat_type, dog_type]),
            pet_name=f"Farm Pet {i+1}",
            breed="Guard Dog" if i == 0 else "Barn Cat",
            age=3.0,
            photo_url=images[6+i],
            district="Dhaka",
            reason="Too many pets",
            status=RehomingListing.Status.ACTIVE,
            policy_accepted=True
        )
        listings.append(listing)

    # 3. Create 6 Rehoming Applications
    print("Creating Rehoming Applications...")
    RehomingApplication.objects.filter(applicant__in=[owner, farmer]).delete()
    
    # Farmer applies to owner's pets
    for i in range(3):
        RehomingApplication.objects.create(
            listing=listings[i],
            applicant=farmer,
            message="I have a large farm and need a good pet.",
            status=RehomingApplication.Status.PENDING
        )
    # Owner applies to farmer's pets (farmer has 2 listings, indices 6 and 7)
    RehomingApplication.objects.create(
        listing=listings[6],
        applicant=owner,
        message="I would love to adopt this farm pet.",
        status=RehomingApplication.Status.PENDING
    )
    RehomingApplication.objects.create(
        listing=listings[7],
        applicant=owner,
        message="I have experience with this breed.",
        status=RehomingApplication.Status.PENDING
    )

    # 4. Create Bookings & Reviews
    print("Creating Bookings and Reviews...")
    Booking.objects.filter(provider=provider).delete()

    # 8+ bookings from farmer
    for i in range(9):
        booking = Booking.objects.create(
            user=farmer,
            provider=provider,
            status=Booking.Status.COMPLETED,
            booking_date=(timezone.now() - timedelta(days=i+1)).date()
        )
        if i < 7: # Create reviews for most
            Review.objects.create(
                booking=booking,
                reviewer=farmer,
                provider=provider,
                rating=5,
                comment="Very professional and knowledgeable vet!"
            )
            
    # Few from owner
    for i in range(4):
        booking = Booking.objects.create(
            user=owner,
            provider=provider,
            status=Booking.Status.COMPLETED,
            booking_date=(timezone.now() - timedelta(days=i+10)).date()
        )
        if i < 3: # Create reviews
            Review.objects.create(
                booking=booking,
                reviewer=owner,
                provider=provider,
                rating=4,
                comment="Good service, helped my pet recover quickly."
            )

    print("Seeding complete! You can now login with owner@pcp.com, farmer@pcp.com, provider@pcp.com with password 'PetCarePlus'")

if __name__ == "__main__":
    run()
