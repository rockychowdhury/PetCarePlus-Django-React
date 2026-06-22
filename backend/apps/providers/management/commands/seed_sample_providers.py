"""
Management command to seed sample service providers with coordinates.
Run: python manage.py seed_sample_providers
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.providers.models import ServiceProvider, ProviderService, ProviderAnimalType
from apps.animals.models import AnimalType
import random
from decimal import Decimal

User = get_user_model()

LOCATIONS = [
    {"division": "dhaka", "district": "Dhaka", "lat": 23.8103, "lng": 90.4125},
    {"division": "dhaka", "district": "Gazipur", "lat": 23.9999, "lng": 90.4203},
    {"division": "dhaka", "district": "Narayanganj", "lat": 23.6238, "lng": 90.5000},
    {"division": "chattogram", "district": "Chattogram", "lat": 22.3569, "lng": 91.7832},
    {"division": "chattogram", "district": "Cumilla", "lat": 23.4607, "lng": 91.1809},
    {"division": "chattogram", "district": "Cox's Bazar", "lat": 21.4272, "lng": 92.0058},
    {"division": "sylhet", "district": "Sylhet", "lat": 24.8949, "lng": 91.8687},
    {"division": "rajshahi", "district": "Rajshahi", "lat": 24.3636, "lng": 88.6241},
    {"division": "khulna", "district": "Khulna", "lat": 22.8456, "lng": 89.5403},
    {"division": "barishal", "district": "Barishal", "lat": 22.7010, "lng": 90.3535},
    {"division": "rangpur", "district": "Rangpur", "lat": 25.7439, "lng": 89.2752},
    {"division": "mymensingh", "district": "Mymensingh", "lat": 24.7471, "lng": 90.4203},
]

PROVIDER_TYPES = [
    ('vet', 'Veterinary Clinic', 'Veterinarian'),
    ('groomer', 'Grooming Parlor', 'Groomer'),
    ('sitter', 'Pet Daycare', 'Sitter'),
    ('trainer', 'Training Center', 'Trainer'),
    ('pharmacy', 'Pet Pharmacy', 'Pharmacist'),
]

NAMES = ["Ahmed", "Rahman", "Hossain", "Chowdhury", "Khan", "Islam", "Ali", "Uddin", "Haque", "Alam", "Begum", "Akter", "Khatun", "Sultana", "Miah", "Biswas", "Saha", "Das", "Roy", "Dev"]
FIRST_NAMES = ["Abul", "Kamrul", "Nazmul", "Sayed", "Rakib", "Tariq", "Hasan", "Jamal", "Kamal", "Shakil", "Sadia", "Nusrat", "Farhana", "Ayesha", "Fatema", "Rina", "Shirin", "Nasrin", "Tania", "Sonia"]

SERVICES_TEMPLATE = {
    'vet': [
        {'name_en': 'General Checkup', 'name_bn': 'সাধারণ স্বাস্থ্য পরীক্ষা', 'price': 500, 'duration_minutes': 30},
        {'name_en': 'Vaccination', 'name_bn': 'টিকা', 'price': 800, 'duration_minutes': 15},
        {'name_en': 'Surgery', 'name_bn': 'অস্ত্রোপচার', 'price': 3000, 'duration_minutes': 120},
    ],
    'groomer': [
        {'name_en': 'Full Grooming Package', 'name_bn': 'সম্পূর্ণ গ্রুমিং প্যাকেজ', 'price': 1500, 'duration_minutes': 60},
        {'name_en': 'Nail Trimming', 'name_bn': 'নখ কাটা', 'price': 300, 'duration_minutes': 15},
        {'name_en': 'Bath & Brush', 'name_bn': 'গোসল এবং ব্রাশ', 'price': 800, 'duration_minutes': 45},
    ],
    'sitter': [
        {'name_en': 'Daycare', 'name_bn': 'ডে কেয়ার', 'price': 1000, 'duration_minutes': 480},
        {'name_en': 'Overnight Boarding', 'name_bn': 'রাতের বোর্ডিং', 'price': 1500, 'duration_minutes': 1440},
    ],
    'trainer': [
        {'name_en': 'Basic Obedience', 'name_bn': 'সাধারণ বাধ্যতা', 'price': 5000, 'duration_minutes': 600},
        {'name_en': 'Behavioral Consultation', 'name_bn': 'আচরণগত পরামর্শ', 'price': 1000, 'duration_minutes': 60},
    ],
    'pharmacy': [
        {'name_en': 'Prescription Filling', 'name_bn': 'প্রেসক্রিপশন পূরণ', 'price': None, 'duration_minutes': 10},
        {'name_en': 'Over-the-Counter Meds', 'name_bn': 'ওভার-দ্য-কাউন্টার ওষুধ', 'price': None, 'duration_minutes': 5},
    ]
}

def generate_random_coordinate(base_lat, base_lng):
    # Add a small random offset to create realistic spread within a district (roughly 5-10km max)
    lat_offset = random.uniform(-0.05, 0.05)
    lng_offset = random.uniform(-0.05, 0.05)
    return base_lat + lat_offset, base_lng + lng_offset

class Command(BaseCommand):
    help = 'Seed 20 sample service providers with realistic locations in Bangladesh'

    def handle(self, *args, **options):
        # Clear existing providers? Optional. Let's just create 20 new ones.
        created_count = 0
        animal_slugs = ['cat', 'dog', 'bird', 'rabbit']

        # Ensure we have all necessary AnimalType objects created or fetch existing
        for slug in animal_slugs:
            animal_type, _ = AnimalType.objects.get_or_create(slug=slug, defaults={'name_en': slug.capitalize(), 'supports_services': True})

        for i in range(1, 21):
            ptype, business_suffix, title = random.choice(PROVIDER_TYPES)
            location = random.choice(LOCATIONS)
            fname = random.choice(FIRST_NAMES)
            lname = random.choice(NAMES)
            business_name = f"{location['district']} {fname}'s {business_suffix}"
            email = f"{ptype}{i}.{location['division']}@example.com".lower()
            
            lat, lng = generate_random_coordinate(location['lat'], location['lng'])
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': fname,
                    'last_name': lname,
                    'phone_number': f"01711{str(i).zfill(6)}",
                    'role': 'provider',
                    'division': location['division'],
                    'district': location['district'],
                }
            )
            if created:
                user.set_password('password123')
                user.save()

            # Create provider
            provider, p_created = ServiceProvider.objects.get_or_create(
                user=user,
                defaults={
                    'business_name': business_name,
                    'provider_type': ptype,
                    'division': location['division'],
                    'district': location['district'],
                    'phone': user.phone_number,
                    'is_verified': True,
                    'latitude': Decimal(str(round(lat, 6))),
                    'longitude': Decimal(str(round(lng, 6))),
                }
            )

            if p_created:
                # Add services
                services = SERVICES_TEMPLATE.get(ptype, [])
                for s_data in services:
                    ProviderService.objects.create(provider=provider, **s_data)

                # Add animals
                num_animals = random.randint(1, len(animal_slugs))
                selected_animals = random.sample(animal_slugs, num_animals)
                for animal_slug in selected_animals:
                    try:
                        animal = AnimalType.objects.get(slug=animal_slug)
                        ProviderAnimalType.objects.get_or_create(provider=provider, animal_type=animal)
                    except AnimalType.DoesNotExist:
                        pass

                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  + Created: {provider.business_name} at ({provider.latitude}, {provider.longitude})"))

        self.stdout.write(self.style.SUCCESS(f'Done! {created_count} providers seeded.'))
