
import os
import django
import sys
import random
from datetime import datetime, timedelta, time
from decimal import Decimal

# Set up Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PetCarePlus.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.services.models import (
    ServiceCategory, ServiceProvider, ServiceMedia, BusinessHours,
    VeterinaryClinic, FosterService, ServiceReview, ServiceOption, Species,
    Specialization, TrainerService, GroomerService, PetSitterService
)
from apps.pets.models import PetProfile, PetMedia, PersonalityTrait, PetPersonality
from apps.rehoming.models import RehomingListing, RehomingRequest

User = get_user_model()

# Constants
PASSWORD = "password123"
PROVIDER_EMAIL = "provider@petcare.com"
USER_EMAIL = "user@petcare.com"

# Sample Data Lists
FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth']
LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor']
PET_NAMES = ['Max', 'Bella', 'Charlie', 'Luna', 'Cooper', 'Daisy', 'Milo', 'Lucy', 'Rocky', 'Molly', 'Buddy']
DOG_BREEDS = ['Labrador Retriever', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Beagle', 'Poodle']
CAT_BREEDS = ['Persian', 'Maine Coon', 'Siamese', 'Ragdoll', 'British Shorthair', 'Bengal']
CITIES = [
    ('San Francisco', 'CA', '94110'),
    ('Los Angeles', 'CA', '90001'),
    ('New York', 'NY', '10001'),
    ('Chicago', 'IL', '60601'),
    ('Austin', 'TX', '73301'),
]

PERSONALITY_TRAITS = ['Friendly', 'Energetic', 'Calm', 'Playful', 'Affectionate', 'Independent', 'Loyal', 'Curious', 'Shy', 'Adventurous']

SERVICE_REVIEWS = [
    "Absolutely amazing service! Highly recommended.",
    "The best care my pet has ever received.",
    "Very professional, clean, and friendly staff.",
    "A bit expensive but worth every penny.",
    "My dog was so happy when I picked him up!",
    "Great communication throughout the whole process.",
    "Will definitely be coming back here.",
    "Five stars! Outstanding experience.",
]

def clean_database():
    """Clear existing data to avoid duplicates"""
    print("Cleaning database...")
    # Be careful with dependencies
    ServiceReview.objects.all().delete()
    ServiceBooking.objects.all().delete() if 'ServiceBooking' in locals() else None
    PetPersonality.objects.all().delete()
    PetMedia.objects.all().delete()
    PetProfile.objects.all().delete()
    
    VeterinaryClinic.objects.all().delete()
    FosterService.objects.all().delete()
    TrainerService.objects.all().delete()
    GroomerService.objects.all().delete()
    PetSitterService.objects.all().delete()
    
    ServiceMedia.objects.all().delete()
    BusinessHours.objects.all().delete()
    ServiceProvider.objects.all().delete()
    
    # We might want to keep some users, but for this exercise let's clean specific ones if they exist
    User.objects.filter(email=PROVIDER_EMAIL).delete()
    User.objects.filter(email=USER_EMAIL).delete()
    
    # Note: We are NOT deleting all users/categories/species to preserve any manual setup, 
    # but we will get_or_create them.
    print("Database cleanup (partial) complete.")

def create_reference_data():
    """Create static reference data"""
    print("Creating/Updating reference data...")
    
    # 1. Personality Traits
    traits = []
    for t in PERSONALITY_TRAITS:
        trait, _ = PersonalityTrait.objects.get_or_create(name=t)
        traits.append(trait)
    
    # 2. Species
    dog, _ = Species.objects.get_or_create(name='Dog', slug='dog')
    cat, _ = Species.objects.get_or_create(name='Cat', slug='cat')
    bird, _ = Species.objects.get_or_create(name='Bird', slug='bird')
    
    # 3. Service Categories & Options & Specializations
    categories = {}
    
    # Veterinary
    vet_cat, _ = ServiceCategory.objects.get_or_create(
        slug='veterinary',
        defaults={'name': 'Veterinary', 'icon_name': 'Stethoscope'}
    )
    categories['veterinary'] = vet_cat
    for opt in ['Wellness Exam', 'Vaccination', 'Surgery', 'Dental', 'Emergency']:
        ServiceOption.objects.get_or_create(category=vet_cat, name=opt)
    
    # Training
    train_cat, _ = ServiceCategory.objects.get_or_create(
        slug='training',
        defaults={'name': 'Training', 'icon_name': 'GraduationCap'}
    )
    categories['training'] = train_cat
    for opt in ['Puppy Training', 'Obedience', 'Behavior Modification']:
        ServiceOption.objects.get_or_create(category=train_cat, name=opt)
    for spec in ['Aggression', 'Anxiety', 'Puppy Socialization']:
        Specialization.objects.get_or_create(category=train_cat, name=spec)

    # Foster
    foster_cat, _ = ServiceCategory.objects.get_or_create(
        slug='foster',
        defaults={'name': 'Foster', 'icon_name': 'Home'}
    )
    categories['foster'] = foster_cat
    
    # Grooming
    groom_cat, _ = ServiceCategory.objects.get_or_create(
        slug='grooming',
        defaults={'name': 'Grooming', 'icon_name': 'Scissors'}
    )
    categories['grooming'] = groom_cat
    
    # Boarding/Sitting
    sit_cat, _ = ServiceCategory.objects.get_or_create(
        slug='boarding',
        defaults={'name': 'Pet Sitting & Boarding', 'icon_name': 'Hotel'}
    )
    categories['boarding'] = sit_cat
    
    print("Reference data created.")
    return categories, [dog, cat, bird], traits

def create_super_provider(categories, species_list):
    """Create the 'highest data' provider"""
    print(f"Creating Super Provider: {PROVIDER_EMAIL}")
    
    dog, cat, bird = species_list
    
    user, created = User.objects.get_or_create(
        email=PROVIDER_EMAIL,
        defaults={
            'first_name': 'Premium',
            'last_name': 'Provider',
            'role': User.UserRole.SERVICE_PROVIDER,
            'account_status': User.AccountStatus.ACTIVE,
            'is_active': True,
            'email_verified': True,
            'phone_verified': True,
            'location_city': 'San Francisco',
            'location_state': 'CA',
            'zip_code': '94105',
            'latitude': Decimal('37.7858'),
            'longitude': Decimal('-122.4008'),
        }
    )
    if created:
        user.set_password(PASSWORD)
        user.save()
        
    provider, _ = ServiceProvider.objects.get_or_create(
        user=user,
        defaults={
            'business_name': 'PetCare Plus Premium Center',
            'category': categories['veterinary'], # Primary category
            'description': ("Welcome to PetCare Plus Premium Center, the ultimate destination for your pet's needs. "
                            "We offer state-of-the-art veterinary care, luxury boarding, and award-winning training. "
                            "Our team of specialists is dedicated to providing the highest quality of life for your furry friends. "
                            "Open 24/7 for emergencies. We have served the community for over 20 years with love and compassion."),
            'website': 'https://premium.petcare.com',
            'address_line1': '100 Premium Way',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94105',
            'latitude': Decimal('37.7858'),
            'longitude': Decimal('-122.4008'),
            'phone': '1-800-PET-CARE',
            'email': 'contact@premium.petcare.com',
            'license_number': 'VET-LIC-99999',
            'verification_status': 'verified',
            'application_status': 'approved',
        }
    )
    
    # Add ALL service types to this provider (if data model supports it - usually 1:1, but let's see)
    # The model has OneToOne for details, so a provider usually has ONE primary type details.
    # However, requirements say "highest data". Let's give it the most complex one: Veterinary with many options.
    
    # Veterinary Details
    vet_details, _ = VeterinaryClinic.objects.get_or_create(
        provider=provider,
        defaults={
            'clinic_type': 'specialty',
            'emergency_services': True,
            'pricing_info': 'Consultation: $150 | Surgery: Starts at $1000',
            'amenities': ['ICU', 'MRI', 'Hydrotherapy', 'Cafe', 'Valet Parking'],
        }
    )
    # Add all species
    vet_details.species_treated.add(dog, cat, bird)
    # Add all vet services
    for opt in ServiceOption.objects.filter(category=categories['veterinary']):
        vet_details.services_offered.add(opt)
        
    # Also add Trainer Details if the model allows multiple... 
    # Looking at models.py: 
    # provider = models.OneToOneField(ServiceProvider, ..., related_name='trainer_details')
    # So a provider CAN have multiple details objects attached to it technically!
    # Let's add them all to make it "highest data".
    
    # Trainer
    trainer_details, _ = TrainerService.objects.get_or_create(
        provider=provider,
        defaults={
            'primary_method': 'positive_reinforcement',
            'training_philosophy': 'We believe in kindness and science.',
            'years_experience': 15,
            'private_session_rate': 120.00,
            'max_clients': 50,
            'accepting_new_clients': True
        }
    )
    trainer_details.species_trained.add(dog)
    
    # Foster
    foster_details, _ = FosterService.objects.get_or_create(
        provider=provider,
        defaults={
            'capacity': 10,
            'current_count': 2,
            'daily_rate': 0.00, # Often free/volunteer
            'monthly_rate': 0.00,
            'environment_details': {'yard': 'Huge', 'indoor': 'Air Conditioned'},
            'care_standards': {'walks': '4x daily'}
        }
    )
    foster_details.species_accepted.add(dog, cat)
    
    # Media: Add many images
    images = [
        'https://images.unsplash.com/photo-1599443015574-be5fe8a05783', # Vet
        'https://images.unsplash.com/photo-1606425271394-c3ca9aa1fc06', # Clinic
        'https://images.unsplash.com/photo-1576201836106-db1758fd1c97', # Dog
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', # Cat
    ]
    for i, img in enumerate(images):
        ServiceMedia.objects.create(
            provider=provider,
            file_url=f"{img}?auto=format&fit=crop&q=80&w=800",
            is_primary=(i==0),
            alt_text=f"Premium Image {i+1}"
        )
        
    # Business Hours (24/7)
    for day in range(7):
        BusinessHours.objects.get_or_create(
            provider=provider,
            day=day,
            defaults={
                'is_closed': False,
                'open_time': time(0, 0),
                'close_time': time(23, 59)
            }
        )
        
    print(f"✓ Created Super Provider: {provider.business_name} with Vet, Trainer, and Foster services.")
    return provider

def create_standard_user(species_list, traits):
    """Create the specific standard user"""
    print(f"Creating Standard User: {USER_EMAIL}")
    
    dog, cat, _ = species_list
    
    user, created = User.objects.get_or_create(
        email=USER_EMAIL,
        defaults={
            'first_name': 'John',
            'last_name': 'Doe',
            'role': User.UserRole.USER,
            'account_status': User.AccountStatus.ACTIVE,
            'is_active': True,
            'email_verified': True,
            'phone_verified': True,
            'location_city': 'Seattle',
            'location_state': 'WA',
        }
    )
    if created:
        user.set_password(PASSWORD)
        user.save()
        
    # Create Pets
    # Pet 1: Dog
    pet1, _ = PetProfile.objects.get_or_create(
        owner=user,
        name='Buster',
        defaults={
            'species': 'dog',
            'breed': 'Golden Retriever',
            'gender': 'male',
            'weight_kg': 30.5,
            'size_category': 'large',
            'spayed_neutered': True,
            'microchipped': True,
            # 'birth_date': datetime.now().date() - timedelta(days=1000), 
            'description': 'A very good boy who loves tennis balls.',
            'status': 'active'
        }
    )
    # Add traits
    # Add traits
    PetPersonality.objects.get_or_create(pet=pet1, trait=traits[0]) # Friendly
    PetPersonality.objects.get_or_create(pet=pet1, trait=traits[1]) # Energetic
    # Add media
    PetMedia.objects.create(pet=pet1, url='https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800', is_primary=True)
    
    print(f"✓ Created user {user.email} with pet {pet1.name}")
    return user

def create_fake_reviews(provider, users):
    """Generate fake reviews for a provider"""
    print(f"Generating reviews for {provider.business_name}...")
    for _ in range(random.randint(5, 12)):
        reviewer = random.choice(users)
        ServiceReview.objects.get_or_create(
            provider=provider,
            reviewer=reviewer,
            defaults={
                'rating_overall': random.randint(4, 5),
                'rating_communication': random.randint(3, 5),
                'rating_cleanliness': random.randint(4, 5),
                'rating_quality': random.randint(4, 5),
                'rating_value': random.randint(3, 5),
                'review_text': random.choice(SERVICE_REVIEWS),
                'verified_client': True
            }
        )

def populate_realistic_data():
    print("=" * 60)
    print("STARTING REALISTIC DATA POPULATION")
    print("=" * 60)
    
    clean_database() # Optional: decide if we want to wipe clean or append. Let's append/update to be safe but clean clean specific targets in verify
    
    categories, species_list, traits = create_reference_data()
    
    # Create Main Actors
    super_provider = create_super_provider(categories, species_list)
    main_user = create_standard_user(species_list, traits)
    

def create_specific_providers(categories, species_list):
    """Create 10 specific providers matching the design"""
    print("Creating 10 Specific Providers...")
    
    dog, cat, bird = species_list
    
    providers_data = [
        # 1. City Paws Medical Center (Vet)
        {
            'name': 'City Paws Medical Center',
            'email': 'citypaws@example.com',
            'category': 'veterinary',
            'city': 'San Francisco', 'state': 'CA', 'zip': '94110',
            'address': 'Mission District',
            'description': 'City Paws Medical Center offers comprehensive veterinary care in the heart of the Mission District. We specialize in dental care and general wellness.',
            'price': 75.00, # Exam
            'rating': 4.8,
            'review_count': 20,
            'tags': ['Wellness Exam', 'Dental', 'Vaccination'],
            'image': 'https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80&w=800', # Green hills/vet vibe
            'specific': {'type': 'VeterinaryClinic', 'clinic_type': 'general', 'emergency': False}
        },
        # 2. Happy Tails Foster (Foster)
        {
            'name': 'Happy Tails Foster',
            'email': 'happytails@example.com',
            'category': 'foster',
            'city': 'San Francisco', 'state': 'CA', 'zip': '94114',
            'address': 'Noe Valley',
            'description': 'Loving foster home in Noe Valley with a large fenced yard. Experienced with both dogs and cats.',
            'price': 45.00, # Night
            'rating': 5.0,
            'review_count': 15,
            'tags': ['Short-term Foster', 'Long-term Foster'],
            'image': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80&w=800', # Dog smiling
            'specific': {'type': 'FosterService', 'yard': 'Fenced Yard', 'capacity': 3}
        },
        # 3. Elite K9 Academy (Trainer)
        {
            'name': 'Elite K9 Academy',
            'email': 'elitek9@example.com',
            'category': 'training',
            'city': 'Daly City', 'state': 'CA', 'zip': '94015',
            'address': 'Daly City Center',
            'description': 'Professional dog training using positive reinforcement techniques. We offer group classes and behavioral modification.',
            'price': 90.00, # Hour
            'rating': 4.2,
            'review_count': 18,
            'tags': ['Obedience', 'Behavior Modification', 'Puppy Training'],
            'image': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=800', # Puppy
            'specific': {'type': 'TrainerService', 'method': 'positive_reinforcement'}
        },
        # 4. Bubble Bath Mobile (Groomer)
        {
            'name': 'Bubble Bath Mobile',
            'email': 'bubblebath@example.com',
            'category': 'grooming',
            'city': 'San Francisco', 'state': 'CA', 'zip': '94103',
            'address': 'Serves SF Area',
            'description': 'We bring the salon to you! Full-service mobile grooming for all breeds and sizes. Hypoallergenic products available.',
            'price': 65.00, # Starts at
            'rating': 4.7,
            'review_count': 25,
            'tags': ['Bath & Brush', 'Full Haircut', 'Nail Trim'],
            'image': 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=800', # Grooming
            'specific': {'type': 'GroomerService', 'salon_type': 'mobile', 'base_price': 65.00}
        },
        # 5. Sarah\'s Pet Care (Sitter)
        {
            'name': 'Sarah\'s Pet Care',
            'email': 'sarahspet@example.com',
            'category': 'boarding', # Mapped to Sitting/Boarding
            'city': 'San Francisco', 'state': 'CA', 'zip': '94115',
            'address': 'Pacific Heights',
            'description': 'Reliable and caring pet sitter in Pacific Heights. Available for dog walking and house sitting.',
            'price': 30.00, # Walk
            'rating': 5.0,
            'review_count': 12,
            'tags': ['Dog Walking', 'House Sitting'],
            'image': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80&w=800', # Sitter
            'specific': {'type': 'PetSitterService', 'walking_rate': 30.00}
        },
        # 6. Bay Area Animal ER (Vet)
        {
            'name': 'Bay Area Animal ER',
            'email': 'eranimal@example.com',
            'category': 'veterinary',
            'city': 'San Mateo', 'state': 'CA', 'zip': '94401',
            'address': 'San Mateo',
            'description': '24/7 Emergency veterinary hospital. Advanced surgical and critical care facilities.',
            'price': 150.00, # Starts at
            'rating': 4.3,
            'review_count': 40,
            'tags': ['Emergency', 'Surgery'],
            'image': 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800', # ER Vet
            'specific': {'type': 'VeterinaryClinic', 'clinic_type': 'emergency', 'emergency': True, 'pricing_info': 'Starts at $150'}
        },
        # 7. Golden Gate Grooming (Groomer - Filler 1)
        {
            'name': 'Golden Gate Grooming',
            'email': 'goldengate@example.com',
            'category': 'grooming',
            'city': 'San Francisco', 'state': 'CA', 'zip': '94118',
            'address': 'Richmond District',
            'description': 'Premium grooming salon specializing in breed-specific cuts.',
            'price': 80.00,
            'rating': 4.9,
            'review_count': 10,
            'tags': ['Full Haircut', 'De-shedding'],
            'image': 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8a9d?auto=format&fit=crop&q=80&w=800',
            'specific': {'type': 'GroomerService', 'salon_type': 'salon', 'base_price': 80.00}
        },
        # 8. Pawsitive Vibes Training (Trainer - Filler 2)
        {
            'name': 'Pawsitive Vibes Training',
            'email': 'pawsitive@example.com',
            'category': 'training',
            'city': 'Oakland', 'state': 'CA', 'zip': '94601',
            'address': 'Oakland Hills',
            'description': 'Building better bonds between pets and owners through positive reinforcement.',
            'price': 100.00,
            'rating': 4.6,
            'review_count': 22,
            'tags': ['Puppy Training', 'Agility'],
            'image': 'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=800',
            'specific': {'type': 'TrainerService', 'method': 'positive_reinforcement'}
        },
        # 9. Cozy Cat Boarding (Boarding - Filler 3)
        {
            'name': 'Cozy Cat Boarding',
            'email': 'cozycat@example.com',
            'category': 'boarding',
            'city': 'Berkeley', 'state': 'CA', 'zip': '94704',
            'address': 'Berkeley',
            'description': 'A quiet, cats-only boarding facility to keep your kitty stress-free.',
            'price': 50.00,
            'rating': 4.8,
            'review_count': 8,
            'tags': ['Overnight Boarding'],
            'image': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=800',
            'specific': {'type': 'PetSitterService', 'house_sitting_rate': 50.00}
        },
        # 10. SF Veterinary Specialists (Vet - Filler 4)
        {
            'name': 'SF Veterinary Specialists',
            'email': 'sfspecialists@example.com',
            'category': 'veterinary',
            'city': 'San Francisco', 'state': 'CA', 'zip': '94110',
            'address': 'Potrero Hill',
            'description': 'Referral hospital for complex medical and surgical cases.',
            'price': 200.00,
            'rating': 4.9,
            'review_count': 35,
            'tags': ['Surgery', 'Wellness Exam'],
            'image': 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=800',
            'specific': {'type': 'VeterinaryClinic', 'clinic_type': 'specialty', 'emergency': False, 'pricing_info': 'Consults start at $200'}
        },
    ]

    users_for_reviews = []
    # Create some dummy users for reviews
    for i in range(20):
        u, _ = User.objects.get_or_create(email=f'reviewer{i}@test.com', defaults={'first_name': f'Reviewer{i}', 'last_name': 'Test'})
        if _: u.set_password(PASSWORD); u.save()
        users_for_reviews.append(u)

    print(f"Created {len(users_for_reviews)} dummy reviewers.")

    for p_data in providers_data:
        # Create User
        user, created = User.objects.get_or_create(
            email=p_data['email'],
            defaults={
                'first_name': p_data['name'].split()[0],
                'last_name': 'Provider',
                'role': User.UserRole.SERVICE_PROVIDER,
                'email_verified': True,
                'phone_verified': True,
                'location_city': p_data['city'],
                'location_state': p_data['state'],
            }
        )
        if created:
            user.set_password(PASSWORD)
            user.save()

        # Create Provider
        provider, _ = ServiceProvider.objects.get_or_create(
            user=user,
            defaults={
                'business_name': p_data['name'],
                'category': categories.get(p_data['category'], categories['veterinary']),
                'description': p_data['description'],
                'address_line1': p_data['address'],
                'city': p_data['city'],
                'state': p_data['state'],
                'zip_code': p_data['zip'],
                'phone': '555-0199',
                'email': p_data['email'],
                'verification_status': 'verified',
                'application_status': 'approved',
                'latitude': Decimal('37.7749'), # Approximate SF lat
                'longitude': Decimal('-122.4194') # Approximate SF long
            }
        )

        # Primary Image
        ServiceMedia.objects.get_or_create(
            provider=provider,
            is_primary=True,
            defaults={'file_url': p_data['image']}
        )
        
        # Tags -> ServiceOptions
        for tag in p_data['tags']:
            ServiceOption.objects.get_or_create(
                category=provider.category,
                name=tag
            )

        # Specific Details
        specific = p_data['specific']
        model_type = specific['type']
        
        if model_type == 'VeterinaryClinic':
            VeterinaryClinic.objects.update_or_create(
                provider=provider,
                defaults={
                    'clinic_type': specific.get('clinic_type', 'general'),
                    'emergency_services': specific.get('emergency', False),
                    'pricing_info': specific.get('pricing_info', f"Exam: ${p_data['price']}"),
                }
            )
        elif model_type == 'FosterService':
            FosterService.objects.update_or_create(
                provider=provider,
                defaults={
                    'daily_rate': Decimal(str(p_data['price'])),
                    'monthly_rate': Decimal(str(p_data['price'] * 20)),
                    'capacity': specific.get('capacity', 2),
                    'environment_details': {'yard': specific.get('yard', 'Standard')}
                }
            )
        elif model_type == 'TrainerService':
             TrainerService.objects.update_or_create(
                provider=provider,
                defaults={
                    'private_session_rate': Decimal(str(p_data['price'])),
                    'primary_method': specific.get('method', 'positive_reinforcement'),
                }
            )
        elif model_type == 'GroomerService':
            GroomerService.objects.update_or_create(
                provider=provider,
                defaults={
                    'base_price': Decimal(str(p_data['price'])),
                    'salon_type': specific.get('salon_type', 'salon'),
                }
            )
        elif model_type == 'PetSitterService':
            PetSitterService.objects.update_or_create(
                provider=provider,
                defaults={
                    'walking_rate': Decimal(str(p_data.get('price', 0) if 'walk' in str(p_data.get('price', 0)) else p_data['price'])),
                    'offers_dog_walking': True,
                    'offers_house_sitting': True 
                }
            )

        # Generate Reviews to match rating
        # We'll generate 'review_count' reviews, mostly matching the rating
        target_rating = p_data['rating']
        
        print(f"Generating reviews for {provider.business_name} (Target: {target_rating})")
        existing_reviews = ServiceReview.objects.filter(provider=provider).count()
        if existing_reviews < p_data['review_count']:
             needed = p_data['review_count'] - existing_reviews
             for k in range(needed):
                 reviewer = random.choice(users_for_reviews)
                 # Weighted random to hit target
                 if random.random() < 0.7:
                     score = int(round(target_rating))
                 else:
                     score = random.choice([4, 5, 3])
                 
                 # Clip to 1-5
                 score = max(1, min(5, score))
                 
                 ServiceReview.objects.get_or_create(
                    provider=provider,
                    reviewer=reviewer,
                    defaults={
                        'rating_overall': score,
                        'rating_communication': score,
                        'rating_cleanliness': score,
                        'rating_quality': score,
                        'rating_value': score,
                        'review_text': "Great service!",
                        'verified_client': True
                    }
                 )

    print("✓ Created 10 Specific Providers.")



def create_rehoming_listings(species_list, traits):
    """Create 10 realistic rehoming listings"""
    print("Creating 10 Rehoming Listings...")
    
    dog, cat, bird = species_list
    
    listing_data = [
        {
            'pet_name': 'Luna', 'species': dog, 'breed': 'Husky Mix', 'age': 3,
            'reason': 'Moving to a smaller apartment that does not allow large dogs.',
            'city': 'San Francisco', 'state': 'CA', 'zip': '94110', 'urgency': 'soon'
        },
        {
            'pet_name': 'Oliver', 'species': cat, 'breed': 'Tabby', 'age': 5,
            'reason': 'Owner developed severe allergies.',
            'city': 'San Jose', 'state': 'CA', 'zip': '95112', 'urgency': 'immediate'
        },
        {
            'pet_name': 'Max', 'species': dog, 'breed': 'German Shepherd', 'age': 2,
            'reason': 'Needs more space and activity than we can provide per work schedule.',
            'city': 'Oakland', 'state': 'CA', 'zip': '94601', 'urgency': 'flexible'
        },
        {
            'pet_name': 'Bella', 'species': cat, 'breed': 'Siamese', 'age': 8,
            'reason': 'Senior owner passed away, needs a quiet loving home.',
            'city': 'Berkeley', 'state': 'CA', 'zip': '94704', 'urgency': 'soon'
        },
        {
            'pet_name': 'Charlie', 'species': dog, 'breed': 'Beagle', 'age': 4,
            'reason': 'Family having a baby and worried about attention.',
            'city': 'San Mateo', 'state': 'CA', 'zip': '94401', 'urgency': 'soon'
        },
        {
            'pet_name': 'Coco', 'species': bird, 'breed': 'Parrot', 'age': 10,
            'reason': 'Moving overseas.',
            'city': 'San Francisco', 'state': 'CA', 'zip': '94122', 'urgency': 'flexible'
        },
        {
            'pet_name': 'Rocky', 'species': dog, 'breed': 'Bulldog', 'age': 6,
            'reason': 'Financial difficulties.',
            'city': 'Daly City', 'state': 'CA', 'zip': '94015', 'urgency': 'immediate'
        },
        {
            'pet_name': 'Lucy', 'species': cat, 'breed': 'Maine Coon', 'age': 1,
            'reason': 'Found as stray, cannot keep.',
            'city': 'San Francisco', 'state': 'CA', 'zip': '94103', 'urgency': 'soon'
        },
        {
            'pet_name': 'Cooper', 'species': dog, 'breed': 'Labrador', 'age': 1,
            'reason': 'Too energetic for current owner health condition.',
            'city': 'Pacifica', 'state': 'CA', 'zip': '94044', 'urgency': 'soon'
        },
        {
            'pet_name': 'Milo', 'species': cat, 'breed': 'Ragdoll', 'age': 3,
            'reason': 'Not getting along with other pets.',
            'city': 'Alameda', 'state': 'CA', 'zip': '94501', 'urgency': 'flexible'
        },
    ]

    for i, data in enumerate(listing_data):
        # Create Owner
        owner_email = f"owner_{i}@example.com"
        owner, _ = User.objects.get_or_create(
            email=owner_email,
            defaults={
                'first_name': f'Owner{i}', 'last_name': 'Rehomer',
                'role': User.UserRole.USER, 'email_verified': True,
                'location_city': data['city'], 'location_state': data['state']
            }
        )
        if _: owner.set_password(PASSWORD); owner.save()

        # Create Pet
        pet, _ = PetProfile.objects.get_or_create(
            owner=owner,
            name=data['pet_name'],
            defaults={
                'species': data['species'].slug, # Model takes string slug
                'breed': data['breed'],
                'birth_date': datetime.now().date() - timedelta(days=data['age']*365),
                'gender': random.choice(['male', 'female']),
                'size_category': 'medium',
                'description': f"A lovely {data['breed']} named {data['pet_name']}.",
                'status': 'active' # Until listed/rehomed
            }
        )
        # Add random traits
        if traits:
             PetPersonality.objects.get_or_create(pet=pet, trait=random.choice(traits))

        # Pet Media (Random placeholder)
        PetMedia.objects.get_or_create(
            pet=pet,
            is_primary=True,
            defaults={'url': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=800'}
        )

        # Create Rehoming Request
        req, _ = RehomingRequest.objects.get_or_create(
            pet=pet,
            owner=owner,
            defaults={
                'status': 'confirmed',
                'terms_accepted': True,
                'reason': data['reason'],
                'urgency': data['urgency'],
                'location_city': data['city'],
                'location_state': data['state'],
                'location_zip': data['zip'],
                'owner_profile_complete': True,
                'pet_profile_complete': True
            }
        )

        # Create Listing
        listing, _ = RehomingListing.objects.get_or_create(
            request=req,
            pet=pet,
            owner=owner,
            defaults={
                'status': 'active',
                'reason': data['reason'], # Copied field
                'urgency': data['urgency'], # Copied field
                'location_city': data['city'],
                'location_state': data['state'],
                'location_zip': data['zip'],
                'view_count': random.randint(10, 100),
                'inquiry_count': random.randint(0, 5)
            }
        )
        print(f"Created listing for {data['pet_name']}")

    print("✓ Created 10 Rehoming Listings.")

def populate_realistic_data():
    print("=" * 60)
    print("STARTING REALISTIC DATA POPULATION")
    print("=" * 60)
    
    clean_database() 
    
    categories, species_list, traits = create_reference_data()
    
    # Create Main Actors
    # super_provider = create_super_provider(categories, species_list) # Optional, can keep or remove
    # main_user = create_standard_user(species_list, traits)
    
    # create_specific_providers
    create_specific_providers(categories, species_list)

    # create rehoming listings
    create_rehoming_listings(species_list, traits)
    
    print("\n" + "=" * 60)
    print("POPULATION COMPLETE")
    print("=" * 60)

if __name__ == '__main__':
    populate_realistic_data()
