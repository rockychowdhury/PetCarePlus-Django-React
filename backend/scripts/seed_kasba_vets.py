import os
import sys
import django
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.providers.models import ServiceProvider
from apps.animals.models import AnimalType

User = get_user_model()

# Delete existing Kasba test providers to avoid duplication
print("Cleaning old Kasba test providers...")
ServiceProvider.objects.filter(user__email__contains='kasba_vet').delete()
User.objects.filter(email__contains='kasba_vet').delete()

images = [
    "https://i.ibb.co.com/TDPhggjC/p12.jpg",
    "https://i.ibb.co.com/bh9X2y0/p11.jpg",
    "https://i.ibb.co.com/S4KX8Dh4/p10.jpg",
    "https://i.ibb.co.com/1t7ndmsp/p9.jpg",
    "https://i.ibb.co.com/2wCFnG7/p7.jpg"
]

# Base coordinates for Gopinathpur, Kasba, Brahmanbaria
base_lat = 23.7333
base_lng = 91.2000

# Vets specification:
# 2 Gov Vets (Cow & Goat)
# 1 Local Vet (Cow & Goat)
# 1 Local Vet (Fish)
# 1 Local Vet (Poultry)
vets_data = [
    {
        "name": "Gopinathpur Govt Veterinary Center",
        "is_gov": True,
        "animals": ["cow", "goat"],
        "email": "kasba_vet1@provider.com"
    },
    {
        "name": "Kasba Upazila Livestock Helpdesk",
        "is_gov": True,
        "animals": ["cow", "goat"],
        "email": "kasba_vet2@provider.com"
    },
    {
        "name": "Brahmanbaria Local Animal Clinic",
        "is_gov": False,
        "animals": ["cow", "goat"],
        "email": "kasba_vet3@provider.com"
    },
    {
        "name": "Gopinathpur Fisheries Health Unit",
        "is_gov": False,
        "animals": ["fish"],
        "email": "kasba_vet4@provider.com"
    },
    {
        "name": "Kasba Poultry & Avian Care Center",
        "is_gov": False,
        "animals": ["poultry"],
        "email": "kasba_vet5@provider.com"
    }
]

print("Creating 5 Kasba vets...")
for i, data in enumerate(vets_data):
    # Add small offsets so they scatter nicely on the map
    lat = base_lat + random.uniform(-0.004, 0.004)
    lng = base_lng + random.uniform(-0.004, 0.004)
    img = images[i % len(images)]

    user = User.objects.create_user(
        email=data["email"],
        password="password123",
        first_name=data["name"].split()[0],
        last_name=" ".join(data["name"].split()[1:]),
        role='provider',
        division='chattogram',
        district='Brahmanbaria',
        upazila='Kasba',
        union='Gopinathpur',
        latitude=lat,
        longitude=lng
    )

    provider = ServiceProvider.objects.create(
        user=user,
        business_name=data["name"],
        provider_type='vet',
        is_government_vet=data["is_gov"],
        profile_image_url=img,
        division='chattogram',
        district='Brahmanbaria',
        upazila='Kasba',
        latitude=lat,
        longitude=lng,
        phone=f"0180000000{i+1}",
        email=user.email,
        is_verified=True,
        avg_rating=round(random.uniform(4.0, 5.0), 1),
        total_reviews=random.randint(5, 50)
    )

    # Link selected animal types
    for anim_slug in data["animals"]:
        try:
            animal = AnimalType.objects.get(slug=anim_slug)
            provider.animal_types.create(animal_type=animal)
        except AnimalType.DoesNotExist:
            print(f"Animal type slug '{anim_slug}' not found, skipping link.")

print("Successfully seeded 5 Kasba Vets in Gopinathpur!")
