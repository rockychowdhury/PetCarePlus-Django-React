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
from django.utils import timezone

User = get_user_model()

# 12 Image Links
images = [
    "https://i.ibb.co.com/TDPhggjC/p12.jpg",
    "https://i.ibb.co.com/bh9X2y0/p11.jpg",
    "https://i.ibb.co.com/S4KX8Dh4/p10.jpg",
    "https://i.ibb.co.com/1t7ndmsp/p9.jpg",
    "https://i.ibb.co.com/DfjbW78h/p8.jpg",
    "https://i.ibb.co.com/2wCFnG7/p7.jpg",
    "https://i.ibb.co.com/WpYWTjRP/p6.jpg",
    "https://i.ibb.co.com/q3TvcnZg/p5.jpg",
    "https://i.ibb.co.com/F4W11C65/p4.jpg",
    "https://i.ibb.co.com/gMLWJQn2/p3.jpg",
    "https://i.ibb.co.com/zTjrcM14/p1.jpg",
    "https://i.ibb.co.com/Z6PT0VCv/p2.jpg"
]

dhaka_locations = [
    {'division': 'Dhaka', 'district': 'Dhaka', 'upazila': 'Dhanmondi', 'lat': 23.7461, 'lng': 90.3742},
    {'division': 'Dhaka', 'district': 'Dhaka', 'upazila': 'Gulshan', 'lat': 23.7925, 'lng': 90.4078},
    {'division': 'Dhaka', 'district': 'Dhaka', 'upazila': 'Banani', 'lat': 23.7940, 'lng': 90.4043},
    {'division': 'Dhaka', 'district': 'Dhaka', 'upazila': 'Uttara', 'lat': 23.8759, 'lng': 90.3996},
    {'division': 'Dhaka', 'district': 'Dhaka', 'upazila': 'Mirpur', 'lat': 23.8223, 'lng': 90.3654},
]

other_locations = [
    {'division': 'Chattogram', 'district': 'Chattogram', 'upazila': 'Panchlaish', 'lat': 22.3569, 'lng': 91.8205},
    {'division': 'Sylhet', 'district': 'Sylhet', 'upazila': 'Sylhet Sadar', 'lat': 24.8949, 'lng': 91.8687},
    {'division': 'Rajshahi', 'district': 'Rajshahi', 'upazila': 'Boalia', 'lat': 24.3636, 'lng': 88.6241},
    {'division': 'Khulna', 'district': 'Khulna', 'upazila': 'Sonadanga', 'lat': 22.8456, 'lng': 89.5403},
    {'division': 'Barishal', 'district': 'Barishal', 'upazila': 'Barishal Sadar', 'lat': 22.7010, 'lng': 90.3535},
]

names = ["Pet Care Hospital", "Happy Paws Clinic", "Furry Friends Shelter", "Green Vet Center", "City Animal Care", "Safe Hands Pet Grooming", "Loyal Pets Training", "Best Care Vet", "Elite Pet Pharmacy", "Guardian Pet Sitter"]

# First update existing ones if any, or just clear old test data?
print("Cleaning old dummy providers...")
ServiceProvider.objects.filter(user__email__contains='dummy').delete()
User.objects.filter(email__contains='dummy').delete()

print("Creating 20 new providers...")
providers = []
for i in range(20):
    loc = random.choice(dhaka_locations) if i < 10 else random.choice(other_locations)
    img = random.choice(images)
    name = f"{random.choice(names)} {i+1}"
    ptype = random.choice([t[0] for t in ServiceProvider.ProviderType.choices])
    is_gov = random.choice([True, False]) if ptype == 'vet' else False

    user = User.objects.create_user(
        email=f"dummy{i}@provider.com",
        password="password123",
        first_name=name.split()[0],
        last_name=" ".join(name.split()[1:]) if len(name.split()) > 1 else "Provider",
        role='provider',
    )

    provider = ServiceProvider.objects.create(
        user=user,
        business_name=name,
        provider_type=ptype,
        is_government_vet=is_gov,
        profile_image_url=img,
        division=loc['division'],
        district=loc['district'],
        upazila=loc['upazila'],
        latitude=loc['lat'],
        longitude=loc['lng'],
        phone=f"01700000{i:02d}",
        email=user.email,
        is_verified=True,
        avg_rating=round(random.uniform(3.5, 5.0), 1),
        total_reviews=random.randint(5, 100),
    )
    providers.append(provider)

print("Mapping animals...")
try:
    dogs = AnimalType.objects.get(slug='dog')
    cats = AnimalType.objects.get(slug='cat')
    birds = AnimalType.objects.get(slug='bird')
    cows = AnimalType.objects.get(slug='cow')
except Exception as e:
    print("Could not find all animals, make sure you ran seed_more_animals.py first.")
    dogs = cats = birds = cows = None

for p in providers:
    if dogs and cats:
        p.animal_types.create(animal_type=dogs)
        p.animal_types.create(animal_type=cats)
    if p.provider_type == 'vet' and cows and birds:
        p.animal_types.create(animal_type=cows)
        p.animal_types.create(animal_type=birds)

print("Done creating 20 providers with profile images.")
