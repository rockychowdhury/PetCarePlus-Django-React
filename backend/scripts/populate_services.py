import os
import django
import sys
import random
from datetime import datetime, time

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PetCarePlus.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.services.models import (
    ServiceCategory, ServiceProvider, ServiceMedia, BusinessHours,
    VeterinaryClinic, FosterService, TrainerService, GroomerService, PetSitterService,
    ServiceReview, ServiceOption, Species
)

User = get_user_model()

def populate_database():
    print("Starting database population...")

    # 1. Ensure Categories Exist
    categories = {
        'veterinary': ServiceCategory.objects.get_or_create(name='Veterinary', slug='veterinary', icon_name='Stethoscope')[0],
        'training': ServiceCategory.objects.get_or_create(name='Training', slug='training', icon_name='GraduationCap')[0],
        'foster': ServiceCategory.objects.get_or_create(name='Foster', slug='foster', icon_name='HeartHandshake')[0],
        'grooming': ServiceCategory.objects.get_or_create(name='Grooming', slug='grooming', icon_name='Scissors')[0],
        'pet_sitting': ServiceCategory.objects.get_or_create(name='Pet Sitting', slug='pet_sitting', icon_name='Armchair')[0],
    }

    # 2. Ensure Species Exist
    dog, _ = Species.objects.get_or_create(name='Dog', slug='dog')
    cat, _ = Species.objects.get_or_create(name='Cat', slug='cat')

    # 3. Create Specific Provider Data (6 Examples from "PetConnect" design)
    providers_data = [
        {
            # 1. City Paws Medical Center (Vet)
            'email': 'provider1@gmail.com', # The requested user
            'password': 'password123',
            'business_name': 'City Paws Medical Center',
            'category': 'veterinary',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94110',
            'address': '123 Mission District Blvd',
            'description': 'Welcome to City Paws Medical Center! We are dedicated to providing the highest quality veterinary care for your beloved pets. Our state-of-the-art facility is equipped to handle everything from routine check-ups to emergency surgeries. We believe in treating every pet as if they were our own.',
            'phone': '(415) 555-0123',
            'website': 'https://citypawsclinic.com',
            'verification_status': 'verified',
            'image': 'https://images.unsplash.com/photo-1599443015574-be5fe8a05783?auto=format&fit=crop&q=80',
            'specific_service_data': {
                'clinic_type': 'general',
                'amenities': ['Digital X-Ray', 'In-house Lab', 'Dental Suite'],
                'base_price': 75.00, # Exam fee
                'emergency_services': True
            },
            'rating_count': 204,
            'avg_rating': 4.8
        },
        {
            # 2. Happy Tails Foster (Foster)
            'email': 'foster@happytails.com',
            'password': 'password123',
            'business_name': 'Happy Tails Foster',
            'category': 'foster',
            'city': 'San Francisco',
            'state': 'CA',
            'zip_code': '94114',
            'address': '456 Noe Valley St',
            'description': 'A loving, temporary home for dogs in transition. We specialize in socializing shy pups and getting them ready for their forever homes. Large fenced yard and plenty of playtime guaranteed!',
            'phone': '(415) 555-0456',
            'website': 'https://happytailsfoster.org',
            'verification_status': 'verified',
            'image': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80',
            'specific_service_data': {
                'capacity': 3,
                'current_count': 1, # 2/3 spots open
                'daily_rate': 45.00,
                'environment_details': {'yard': 'large_fenced', 'kids': 'yes', 'other_pets': 'yes'}
            },
            'rating_count': 42,
            'avg_rating': 5.0
        },
        {
            # 3. Elite K9 Academy (Trainer)
            'email': 'trainer@elitek9.com',
            'password': 'password123',
            'business_name': 'Elite K9 Academy',
            'category': 'training',
            'city': 'Daly City',
            'state': 'CA',
            'zip_code': '94015',
            'address': '789 Top Dog Lane',
            'description': 'Science-based, positive reinforcement training for dogs of all ages. From puppy basics to advanced behavioral modification. We help you build a lasting bond with your canine companion.',
            'phone': '(650) 555-0789',
            'website': 'https://elitek9academy.com',
            'verification_status': 'pending', # Example of unverified
            'image': 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&q=80', # Reusing/Changing image
            'image': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80',
            'specific_service_data': {
                'primary_method': 'positive_reinforcement',
                'private_session_rate': 90.00,
                'offers_group_classes': True
            },
            'rating_count': 18,
            'avg_rating': 4.2
        },
        {
            # 4. Bubble Bath Mobile (Grooming)
            'email': 'groomer@bubblebath.com',
            'password': 'password123',
            'business_name': 'Bubble Bath Mobile',
            'category': 'grooming',
            'city': 'San Bruno',
            'state': 'CA',
            'zip_code': '94066',
            'address': 'Mobile Service (Serving SF Area)',
            'description': 'We bring the salon to your driveway! Stress-free, one-on-one grooming in our state-of-the-art mobile van. Perfect for anxious pets or busy owners.',
            'phone': '(650) 555-0101',
            'website': 'https://bubblebathmobile.com',
            'verification_status': 'verified',
            'image': 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80',
            'specific_service_data': {
                'salon_type': 'mobile',
                'base_price': 65.00,
                'amenities': ['Hypoallergenic Shampoo', 'Mobile Van']
            },
            'rating_count': 89,
            'avg_rating': 4.7
        },
        {
            # 5. Sarah's Pet Care (Sitter)
            'email': 'sarah@petcare.com',
            'password': 'password123',
            'business_name': "Sarah's Pet Care",
            'category': 'pet_sitting',
            'city': 'Pacific Heights',
            'state': 'SF', # Using SF as state suffix just for visual variety if needed, but keeping standard
            'zip_code': '94115',
            'address': '321 Pacific Ave',
            'description': 'Reliable, trustworthy pet sitting and dog walking. I have 5 years of experience and am pet CPR certified. your pets are safe with me!',
            'phone': '(415) 555-0202',
            'website': 'https://sarahspetcare.com',
            'verification_status': 'verified',
            'image': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80', # Reuse fallback or new
            'image': 'https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&q=80',
            'specific_service_data': {
                'offers_dog_walking': True,
                'offers_house_sitting': True,
                'walking_rate': 30.00
            },
            'rating_count': 12,
            'avg_rating': 5.0
        },
        {
            # 6. Bay Area Animal ER (Vet - Emergency)
            'email': 'er@bayareavet.com',
            'password': 'password123',
            'business_name': 'Bay Area Animal ER',
            'category': 'veterinary',
            'city': 'San Mateo',
            'state': 'CA',
            'zip_code': '94401',
            'address': '555 El Camino Real',
            'description': '24/7 Emergency Veterinary Care. When seconds count, we are here for you. Trauma, toxicity, and critical care specialists on site at all times.',
            'phone': '(650) 555-9999',
            'website': 'https://bayareaanimaler.com',
            'verification_status': 'verified',
            'image': 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80',
            'specific_service_data': {
                'clinic_type': 'emergency',
                'emergency_services': True,
                'base_price': 150.00
            },
            'rating_count': 310,
            'avg_rating': 4.3
        }
    ]

    for p_data in providers_data:
        # 1. Create/Get User
        email = p_data['email']
        user, created = User.objects.get_or_create(email=email)
        user.set_password(p_data['password'])
        user.first_name = p_data['business_name'].split(' ')[0]
        user.last_name = 'Provider'
        user.role = User.UserRole.SERVICE_PROVIDER
        user.account_status = User.AccountStatus.ACTIVE
        user.email_verified = True
        user.phone_verified = True
        user.location_city = p_data['city']
        user.location_state = p_data['state']
        user.save()

        # 2. Create ServiceProvider
        cat_instance = categories[p_data['category']]
        provider, _ = ServiceProvider.objects.get_or_create(user=user)
        
        provider.business_name = p_data['business_name']
        provider.category = cat_instance
        provider.description = p_data['description']
        provider.city = p_data['city']
        provider.state = p_data['state']
        provider.zip_code = p_data['zip_code']
        provider.address_line1 = p_data['address']
        provider.phone = p_data['phone']
        provider.website = p_data['website']
        provider.verification_status = p_data['verification_status']
        provider.save()

        # 3. Create Specific Details
        specifics = p_data['specific_service_data']
        
        if p_data['category'] == 'veterinary':
            vet, _ = VeterinaryClinic.objects.update_or_create(
                provider=provider,
                defaults={
                    'clinic_type': specifics.get('clinic_type', 'general'),
                    'emergency_services': specifics.get('emergency_services', False),
                    'amenities': specifics.get('amenities', []),
                    'pricing_info': f"Starts at ${specifics.get('base_price', 50)}"
                }
            )
            
        elif p_data['category'] == 'foster':
            daily_rate = specifics.get('daily_rate', 25.00)
            FosterService.objects.update_or_create(
                provider=provider,
                defaults={
                    'capacity': specifics.get('capacity', 2),
                    'current_count': specifics.get('current_count', 0),
                    'daily_rate': daily_rate,
                    'monthly_rate': daily_rate * 30
                }
            )

        elif p_data['category'] == 'training':
             TrainerService.objects.update_or_create(
                provider=provider,
                defaults={
                    'primary_method': specifics.get('primary_method', 'positive_reinforcement'),
                    'private_session_rate': specifics.get('private_session_rate', 80.00),
                    'offers_group_classes': specifics.get('offers_group_classes', False)
                }
            )

        elif p_data['category'] == 'grooming':
            GroomerService.objects.update_or_create(
                provider=provider,
                defaults={
                    'salon_type': specifics.get('salon_type', 'salon'),
                    'base_price': specifics.get('base_price', 50.00),
                    'amenities': specifics.get('amenities', [])
                }
            )
            
        elif p_data['category'] == 'pet_sitting':
            PetSitterService.objects.update_or_create(
                provider=provider,
                defaults={
                    'offers_dog_walking': specifics.get('offers_dog_walking', True),
                    'walking_rate': specifics.get('walking_rate', 25.00)
                }
            )

        # 4. Media
        if ServiceMedia.objects.filter(provider=provider).count() == 0:
            ServiceMedia.objects.create(
                provider=provider,
                file_url=p_data['image'],
                is_primary=True
            )

        # 5. Reviews (Fake it to match avg_rating)
        # Create one review that matches the exact rating requested or creates the average
        current_review_count = provider.reviews.count()
        if current_review_count < 1:
            # Create a dummy review with the target rating
            # Reviewer can be any user, let's just make one dummy reviewer or use admin
            reviewer, _ = User.objects.get_or_create(email='reviewer@example.com', defaults={'first_name': 'Reviewer', 'last_name': 'Bot'})
            
            target_rating = int(p_data['avg_rating']) # Round down for simplicity or use exact if int
            
            ServiceReview.objects.create(
                provider=provider,
                reviewer=reviewer,
                rating_overall=target_rating,
                rating_communication=target_rating,
                rating_cleanliness=target_rating,
                rating_quality=target_rating,
                rating_value=target_rating,
                review_text="Great service! specific detailed feedback here."
            )
            
            print(f"Created provider: {provider.business_name} ({provider.category.name})")

    print("\nDatabase population complete!")

if __name__ == '__main__':
    populate_database()
