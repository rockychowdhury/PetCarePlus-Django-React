import os
import sys
import random
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")
django.setup()

from django.contrib.auth import get_user_model
from apps.providers.models import ServiceProvider, ProviderService, ProviderAnimalType
from apps.animals.models import AnimalType

User = get_user_model()

IMAGES = [
    "https://i.ibb.co.com/mr1SR4Tq/favicon.png",
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
    "https://i.ibb.co.com/Z6PT0VCv/p2.jpg",
    "https://i.ibb.co.com/5gpD0DMR/pexels-622177503-33238049.jpg",
    "https://i.ibb.co.com/fVhtZ4zV/p1.jpg",
    "https://i.ibb.co.com/b5bVtsLF/logo2.jpg",
    "https://i.ibb.co.com/hWK4ZpT/petDP.jpg",
]

LOCATIONS = [
    {"division": "chittagong", "district": "Brahmanbaria", "upazila": "Kasba"},
    {"division": "dhaka", "district": "Dhaka", "upazila": "Mirpur"},
]

SERVICES = {
    'vet': [
        {"en": "General Checkup", "bn": "সাধারণ চেকআপ", "price": 500, "dur": 30},
        {"en": "Vaccination", "bn": "টিকা", "price": 300, "dur": 15},
        {"en": "Surgery", "bn": "সার্জারি", "price": 5000, "dur": 120},
        {"en": "Dental Cleaning", "bn": "দাঁত পরিষ্কার", "price": 1000, "dur": 45},
        {"en": "Deworming", "bn": "কৃমিনাশক", "price": 200, "dur": 10},
    ],
    'pharmacy': [
        {"en": "Pet Medicine", "bn": "পশুর ওষুধ", "price": 0, "dur": 0},
        {"en": "Supplements", "bn": "সাপ্লিমেন্ট", "price": 0, "dur": 0},
        {"en": "Pet Accessories", "bn": "পেট এক্সেসরিজ", "price": 0, "dur": 0},
    ],
    'groomer': [
        {"en": "Full Bath", "bn": "গোসল", "price": 800, "dur": 60},
        {"en": "Hair Cut", "bn": "চুল কাটা", "price": 500, "dur": 40},
        {"en": "Nail Trimming", "bn": "নখ কাটা", "price": 200, "dur": 15},
    ],
    'trainer': [
        {"en": "Basic Obedience", "bn": "সাধারণ প্রশিক্ষণ", "price": 1500, "dur": 60},
        {"en": "Behavior Correction", "bn": "আচরণ সংশোধন", "price": 2000, "dur": 60},
    ],
    'sitter': [
        {"en": "Day Care", "bn": "ডে কেয়ার", "price": 1000, "dur": 480},
        {"en": "Overnight Boarding", "bn": "রাত্রিকালীন বোর্ডিং", "price": 2000, "dur": 1440},
        {"en": "Dog Walking", "bn": "কুকুর হাঁটানো", "price": 300, "dur": 30},
    ]
}

def seed_providers():
    print("Seeding 30 Providers...")

    all_animals = list(AnimalType.objects.all())
    if not all_animals:
        print("Warning: No Animal Types found. Please run seed.py first.")
        
    for i in range(1, 31):
        email = f"provider{i}@pcp.com"
        password = "PetCarePlus"
        
        # 1. Create User
        user, created = User.objects.get_or_create(email=email, defaults={'role': 'provider'})
        if created:
            user.set_password(password)
            user.save()
            print(f"Created user {email}")
        else:
            print(f"User {email} already exists. Updating...")
            user.set_password(password)
            user.role = 'provider'
            user.save()

        # 2. Create Provider
        ptypes = [pt[0] for pt in ServiceProvider.ProviderType.choices]
        ptype = random.choice(ptypes)
        loc = random.choice(LOCATIONS)
        
        provider, _ = ServiceProvider.objects.update_or_create(
            user=user,
            defaults={
                'business_name': f"Pet Care {ptype.capitalize()} {i}",
                'description_en': f"Professional {ptype} services in {loc['upazila']}, {loc['district']}.",
                'description_bn': f"{loc['upazila']}, {loc['district']}-এ পেশাদার {ptype} সেবা।",
                'provider_type': ptype,
                'is_verified': True,
                'profile_image_url': random.choice(IMAGES),
                'division': loc['division'],
                'district': loc['district'],
                'upazila': loc['upazila'],
                'phone': f"017000000{i:02d}",
                'email': email,
                'avg_rating': round(random.uniform(3.5, 5.0), 1),
                'total_reviews': random.randint(1, 50)
            }
        )
        
        # 3. Create Services (2 to 5)
        provider.services.all().delete()
        available_services = SERVICES.get(ptype, SERVICES['vet'])
        num_services = random.randint(2, min(5, len(available_services)))
        chosen_services = random.sample(available_services, num_services)
        
        for s in chosen_services:
            ProviderService.objects.create(
                provider=provider,
                name_en=s['en'],
                name_bn=s['bn'],
                price=s['price'],
                duration_minutes=s['dur']
            )
            
        # 4. Create Animal Types (randomly support 1 to 4 animals)
        provider.animal_types.all().delete()
        if all_animals:
            num_animals = random.randint(1, min(4, len(all_animals)))
            chosen_animals = random.sample(all_animals, num_animals)
            for a in chosen_animals:
                ProviderAnimalType.objects.create(
                    provider=provider,
                    animal_type=a
                )
                
    print("Successfully seeded 30 providers with random services and animals.")

if __name__ == "__main__":
    seed_providers()
