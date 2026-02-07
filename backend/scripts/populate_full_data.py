import os
import django
import sys
import random
from datetime import datetime, timedelta, time
from decimal import Decimal

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PetCarePlus.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.services.models import (
    ServiceCategory, ServiceProvider, ServiceMedia, BusinessHours,
    VeterinaryClinic, FosterService, ServiceReview, ServiceOption, Species
)
from apps.pets.models import PetProfile, PetMedia, PersonalityTrait, PetPersonality

User = get_user_model()

# Sample data
FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth']
LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor']
PET_NAMES = ['Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Daisy', 'Milo', 'Lucy', 'Rocky', 'Molly', 'Buddy', 'Sadie', 'Jack', 'Maggie', 'Duke']
DOG_BREEDS = ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle', 'Rottweiler', 'Yorkshire Terrier']
CAT_BREEDS = ['Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair', 'Bengal', 'Sphynx', 'American Shorthair']
CITIES = [
    ('San Francisco', 'CA', '94110'),
    ('Los Angeles', 'CA', '90001'),
    ('San Diego', 'CA', '92101'),
    ('Oakland', 'CA', '94601'),
    ('Sacramento', 'CA', '95814'),
]

PERSONALITY_TRAITS = ['Friendly', 'Energetic', 'Calm', 'Playful', 'Affectionate', 'Independent', 'Loyal', 'Curious', 'Shy', 'Adventurous']
PET_IMAGES = [
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1573865526739-10c1d3a0e4c7?auto=format&fit=crop&q=80&w=800',
]

SERVICE_REVIEWS = [
    "Excellent service! Very professional and caring.",
    "Great experience, highly recommend!",
    "My pet loved it here. Will definitely return.",
    "Outstanding care and attention to detail.",
    "Very satisfied with the service provided.",
]

def create_personality_traits():
    """Create personality traits if they don't exist"""
    print("Creating personality traits...")
    for trait_name in PERSONALITY_TRAITS:
        PersonalityTrait.objects.get_or_create(name=trait_name)
    print(f"✓ Created {len(PERSONALITY_TRAITS)} personality traits")

def create_service_categories():
    """Create service categories"""
    print("Creating service categories...")
    categories = {
        'veterinary': ServiceCategory.objects.get_or_create(
            name='Veterinary', 
            slug='veterinary', 
            defaults={'icon_name': 'Stethoscope'}
        )[0],
        'foster': ServiceCategory.objects.get_or_create(
            name='Foster', 
            slug='foster',
            defaults={'icon_name': 'HeartHandshake'}
        )[0],
    }
    print(f"✓ Created {len(categories)} service categories")
    return categories

def create_species():
    """Create species"""
    print("Creating species...")
    dog, _ = Species.objects.get_or_create(name='Dog', slug='dog')
    cat, _ = Species.objects.get_or_create(name='Cat', slug='cat')
    print("✓ Created species (Dog, Cat)")
    return dog, cat

def create_users_with_pets(count=10):
    """Create regular users with pet profiles"""
    print(f"\nCreating {count} users with pet profiles...")
    users = []
    
    for i in range(count):
        city_data = random.choice(CITIES)
        email = f'user{i+1}@example.com'
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'first_name': random.choice(FIRST_NAMES),
                'last_name': random.choice(LAST_NAMES),
                'role': User.UserRole.USER,
                'account_status': User.AccountStatus.ACTIVE,
                'is_active': True,
                'email_verified': True,
                'phone_verified': True,
                'location_city': city_data[0],
                'location_state': city_data[1],
                'zip_code': city_data[2],
            }
        )
        
        if created:
            user.set_password('password123')
            user.save()
        
        users.append(user)
        
        # Create 1-2 pets per user
        num_pets = random.randint(1, 2)
        for j in range(num_pets):
            species = random.choice(['dog', 'cat'])
            breed = random.choice(DOG_BREEDS if species == 'dog' else CAT_BREEDS)
            
            pet = PetProfile.objects.create(
                owner=user,
                name=random.choice(PET_NAMES),
                species=species,
                breed=breed,
                gender=random.choice(['male', 'female']),
                weight_kg=Decimal(random.randint(5, 40)),
                size_category=random.choice(['small', 'medium', 'large']),
                spayed_neutered=random.choice([True, False]),
                microchipped=random.choice([True, False]),
                birth_date=datetime.now().date() - timedelta(days=random.randint(365, 3650)),
                description=f"A wonderful {species} looking for a loving home.",
                status='active'
            )
            
            # Add pet media
            for k in range(random.randint(3, 5)):
                PetMedia.objects.create(
                    pet=pet,
                    url=random.choice(PET_IMAGES),
                    is_primary=(k == 0)
                )
            
            # Add personality traits
            selected_traits = random.sample(PERSONALITY_TRAITS, random.randint(2, 4))
            for trait_name in selected_traits:
                trait = PersonalityTrait.objects.get(name=trait_name)
                PetPersonality.objects.create(pet=pet, trait=trait)
            
            print(f"  ✓ Created pet: {pet.name} ({species}) for {user.first_name}")
    
    print(f"✓ Created {len(users)} users with pets")
    return users

def create_service_providers(categories, dog, cat, count=6):
    """Create service providers"""
    print(f"\nCreating {count} service providers...")
    providers = []
    
    providers_data = [
        {
            'email': 'vet1@example.com',
            'business_name': 'City Veterinary Clinic',
            'category': 'veterinary',
            'city': 'San Francisco', 'state': 'CA', 'zip_code': '94110',
            'address': '123 Main St',
            'description': 'Full-service veterinary clinic providing comprehensive care for your pets. We offer wellness exams, vaccinations, surgery, and emergency services.',
            'phone': '(415) 555-0001',
            'website': 'https://cityvet.com',
            'image': 'https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80&w=1200',
            'specific': {'clinic_type': 'general', 'emergency_services': True, 'base_price': 75.00},
        },
        {
            'email': 'vet2@example.com',
            'business_name': 'Emergency Pet Hospital',
            'category': 'veterinary',
            'city': 'Los Angeles', 'state': 'CA', 'zip_code': '90001',
            'address': '456 Emergency Ave',
            'description': '24/7 Emergency veterinary services. Trauma specialists, critical care, and advanced diagnostics available around the clock.',
            'phone': '(213) 555-0002',
            'website': 'https://emergencypet.com',
            'image': 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=1200',
            'specific': {'clinic_type': 'emergency', 'emergency_services': True, 'base_price': 150.00},
        },
        {
            'email': 'foster1@example.com',
            'business_name': 'Happy Tails Foster Care',
            'category': 'foster',
            'city': 'San Diego', 'state': 'CA', 'zip_code': '92101',
            'address': '789 Foster Lane',
            'description': 'Loving foster care for dogs and cats. Large outdoor space, experienced handlers, and personalized attention for each pet.',
            'phone': '(619) 555-0003',
            'website': 'https://happytails.com',
            'image': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=1200',
            'specific': {'capacity': 5, 'current_count': 2, 'daily_rate': 40.00, 'monthly_rate': 1000.00},
        },
        {
            'email': 'foster2@example.com',
            'business_name': 'Paws & Hearts Foster',
            'category': 'foster',
            'city': 'Oakland', 'state': 'CA', 'zip_code': '94601',
            'address': '321 Care St',
            'description': 'Professional foster care with a home-like environment. Specializing in senior pets and those with special needs.',
            'phone': '(510) 555-0004',
            'website': 'https://pawshearts.com',
            'image': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1200',
            'specific': {'capacity': 3, 'current_count': 1, 'daily_rate': 45.00, 'monthly_rate': 1200.00},
        },
        {
            'email': 'vet3@example.com',
            'business_name': 'Mobile Vet Services',
            'category': 'veterinary',
            'city': 'Sacramento', 'state': 'CA', 'zip_code': '95814',
            'address': 'Mobile Service',
            'description': 'Convenient mobile veterinary services. We bring quality care to your doorstep, reducing stress for your pets.',
            'phone': '(916) 555-0005',
            'website': 'https://mobilevet.com',
            'image': 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=1200',
            'specific': {'clinic_type': 'mobile', 'emergency_services': False, 'base_price': 100.00},
        },
        {
            'email': 'foster3@example.com',
            'business_name': 'Sunshine Foster Home',
            'category': 'foster',
            'city': 'San Francisco', 'state': 'CA', 'zip_code': '94115',
            'address': '555 Sunshine Blvd',
            'description': 'Warm and caring foster home for pets in transition. Experienced with behavioral training and socialization.',
            'phone': '(415) 555-0006',
            'website': 'https://sunshinefoster.com',
            'image': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=1200',
            'specific': {'capacity': 4, 'current_count': 3, 'daily_rate': 35.00, 'monthly_rate': 900.00},
        },
    ]
    
    for p_data in providers_data:
        # Create user
        user, created = User.objects.get_or_create(
            email=p_data['email'],
            defaults={
                'first_name': p_data['business_name'].split()[0],
                'last_name': 'Provider',
                'role': User.UserRole.SERVICE_PROVIDER,
                'account_status': User.AccountStatus.ACTIVE,
                'is_active': True,
                'email_verified': True,
                'phone_verified': True,
                'location_city': p_data['city'],
                'location_state': p_data['state'],
            }
        )
        
        if created:
            user.set_password('password123')
            user.save()
        
        # Create service provider
        provider, _ = ServiceProvider.objects.get_or_create(
            user=user,
            defaults={
                'business_name': p_data['business_name'],
                'category': categories[p_data['category']],
                'description': p_data['description'],
                'city': p_data['city'],
                'state': p_data['state'],
                'zip_code': p_data['zip_code'],
                'address_line1': p_data['address'],
                'phone': p_data['phone'],
                'email': p_data['email'],
                'website': p_data['website'],
                'verification_status': 'verified',
                'application_status': 'approved',
            }
        )
        
        # Create specific service details
        if p_data['category'] == 'veterinary':
            VeterinaryClinic.objects.get_or_create(
                provider=provider,
                defaults={
                    'clinic_type': p_data['specific']['clinic_type'],
                    'emergency_services': p_data['specific']['emergency_services'],
                    'pricing_info': f"Starting at ${p_data['specific']['base_price']}",
                    'amenities': ['Digital X-Ray', 'Surgery Suite', 'Pharmacy'],
                }
            )
            # Add species treated
            vet_details = provider.vet_details
            vet_details.species_treated.add(dog, cat)
            
        elif p_data['category'] == 'foster':
            FosterService.objects.get_or_create(
                provider=provider,
                defaults={
                    'capacity': p_data['specific']['capacity'],
                    'current_count': p_data['specific']['current_count'],
                    'daily_rate': Decimal(str(p_data['specific']['daily_rate'])),
                    'monthly_rate': Decimal(str(p_data['specific']['monthly_rate'])),
                    'environment_details': {'yard': 'large_fenced', 'indoor': 'spacious'},
                    'care_standards': {'exercise': 'daily_walks', 'feeding': '2x_daily'},
                }
            )
            # Add species accepted
            foster_details = provider.foster_details
            foster_details.species_accepted.add(dog, cat)
        
        # Add media
        ServiceMedia.objects.get_or_create(
            provider=provider,
            defaults={
                'file_url': p_data['image'],
                'is_primary': True,
            }
        )
        
        # Add business hours
        for day in range(7):  # 0=Monday, 6=Sunday
            BusinessHours.objects.get_or_create(
                provider=provider,
                day=day,
                defaults={
                    'is_closed': day >= 5,  # Closed on weekends
                    'open_time': time(9, 0) if day < 5 else None,
                    'close_time': time(17, 0) if day < 5 else None,
                }
            )
        
        providers.append(provider)
        print(f"  ✓ Created provider: {provider.business_name}")
    
    print(f"✓ Created {len(providers)} service providers")
    return providers

def create_reviews_for_providers(providers, users):
    """Create reviews for each provider from users"""
    print(f"\nCreating reviews for providers...")
    total_reviews = 0
    
    for provider in providers:
        # Create 10-15 reviews per provider
        num_reviews = random.randint(10, 15)
        
        selected_users = random.sample(users, min(num_reviews, len(users)))
        
        for user in selected_users:
            rating = random.randint(4, 5)
            
            ServiceReview.objects.get_or_create(
                provider=provider,
                reviewer=user,
                defaults={
                    'rating_overall': rating,
                    'rating_communication': random.randint(4, 5),
                    'rating_cleanliness': random.randint(4, 5),
                    'rating_quality': random.randint(4, 5),
                    'rating_value': random.randint(3, 5),
                    'review_text': random.choice(SERVICE_REVIEWS),
                }
            )
            total_reviews += 1
        
        print(f"  ✓ Added {num_reviews} reviews for {provider.business_name}")
    
    print(f"✓ Created {total_reviews} total reviews")

def populate_database():
    """Main population function"""
    print("=" * 60)
    print("STARTING DATABASE POPULATION")
    print("=" * 60)
    
    # Step 1: Create personality traits
    create_personality_traits()
    
    # Step 2: Create service categories and species
    categories = create_service_categories()
    dog, cat = create_species()
    
    # Step 3: Create users with pets
    users = create_users_with_pets(count=10)
    
    # Step 4: Create service providers
    providers = create_service_providers(categories, dog, cat, count=6)
    
    # Step 5: Create reviews
    create_reviews_for_providers(providers, users)
    
    print("\n" + "=" * 60)
    print("DATABASE POPULATION COMPLETE!")
    print("=" * 60)
    print(f"Total Users: {User.objects.filter(role='user').count()}")
    print(f"Total Pets: {PetProfile.objects.count()}")
    print(f"Total Service Providers: {ServiceProvider.objects.count()}")
    print(f"Total Reviews: {ServiceReview.objects.count()}")
    print("=" * 60)

if __name__ == '__main__':
    populate_database()
