import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PetCarePlus.settings')
django.setup()

from apps.services.models import ServiceCategory, ServiceOption, Species, Specialization
from apps.pets.models import PersonalityTrait

def populate_defaults():
    print("Starting default data population...")

    # 1. Species
    species_list = ['Dog', 'Cat', 'Rabbit', 'Bird', 'Hamster', 'Guinea Pig', 'Reptile', 'Fish', 'Horse']
    for s_name in species_list:
        Species.objects.get_or_create(name=s_name, slug=s_name.replace(' ', '-').lower())
    print(f"✓ Ensured {len(species_list)} Species exist")

    # 2. Service Categories
    categories_data = [
        {'name': 'Veterinary', 'slug': 'veterinary', 'icon': 'Stethoscope'},
        {'name': 'Training', 'slug': 'training', 'icon': 'GraduationCap'},
        {'name': 'Foster', 'slug': 'foster', 'icon': 'HeartHandshake'},
        {'name': 'Grooming', 'slug': 'grooming', 'icon': 'Scissors'},
        {'name': 'Pet Sitting', 'slug': 'pet_sitting', 'icon': 'Armchair'},
        {'name': 'Boarding', 'slug': 'boarding', 'icon': 'Hotel'}, # Added Boarding
    ]
    
    categories = {}
    for cat_data in categories_data:
        cat, created = ServiceCategory.objects.get_or_create(
            slug=cat_data['slug'],
            defaults={
                'name': cat_data['name'],
                'icon_name': cat_data['icon']
            }
        )
        categories[cat.slug] = cat
    print(f"✓ Ensured {len(categories)} Service Categories exist")

    # 3. Personality Traits
    traits = [
        'Friendly', 'Energetic', 'Calm', 'Playful', 'Affectionate', 
        'Independent', 'Loyal', 'Curious', 'Shy', 'Adventurous',
        'Intelligent', 'Protective', 'Vocal', 'Quiet', 'Reactive',
        'Anxious', 'Food Motivated', 'Good with Kids', 'Good with other pets'
    ]
    for trait_name in traits:
        PersonalityTrait.objects.get_or_create(name=trait_name)
    print(f"✓ Ensured {len(traits)} Personality Traits exist")

    # 4. Specializations
    specializations_data = {
        'veterinary': ['General Practice', 'Emergency', 'Surgery', 'Dermatology', 'Dentistry', 'Oncology', 'Behavior'],
        'training': ['Puppy Training', 'Obedience', 'Behavior Modification', 'Agility', 'Service Dog Training'],
        'foster': ['Neonatal/Bottle Feeding', 'Medical Needs', 'Behavioral Rehabilitation', 'Hospice Care'],
        'grooming': ['Breed Specific', 'Creative Grooming', 'Hand Stripping'],
        'pet_sitting': ['Medication Administration', 'Senior Pet Care', 'Puppy Care'],
    }

    for cat_slug, specs in specializations_data.items():
        if cat_slug in categories:
            for spec_name in specs:
                Specialization.objects.get_or_create(category=categories[cat_slug], name=spec_name)
    print("✓ Ensured Specializations exist")

    # 5. Service Options
    # Veterinary
    vet_options = [
        'Wellness Exam', 'Vaccination', 'Surgery', 'Dental Cleaning', 'Emergency Consult',
        'Spay/Neuter', 'Microchipping', 'Deworming', 'Senior Checkup', 'Puppy/Kitten Exam'
    ]
    for opt in vet_options:
        ServiceOption.objects.get_or_create(category=categories['veterinary'], name=opt)
        
    # Grooming
    groom_options = [
        'Bath & Brush', 'Full Groom', 'Nail Trim', 'De-shedding Treatment',
        'Ear Cleaning', 'Teeth Brushing', 'Flea Treatment', 'Anal Gland Expression'
    ]
    for opt in groom_options:
        ServiceOption.objects.get_or_create(category=categories['grooming'], name=opt)

    # Training
    train_options = [
        'Private Session', 'Group Class', 'Behavioral Evaluation', 'Puppy Kindergarten',
        'Board & Train', 'Virtual Consultation', 'Agility Class'
    ]
    for opt in train_options:
        ServiceOption.objects.get_or_create(category=categories['training'], name=opt)
        
    # Foster (Often less standardized, but adding basics)
    foster_options = ['Short-term Foster', 'Long-term Foster', 'Medical Foster', 'Hospice Foster', 'Respite Care']
    for opt in foster_options:
        ServiceOption.objects.get_or_create(category=categories['foster'], name=opt)
        
    # Pet Sitting
    sit_options = [
        'Dog Walking', 'House Sitting', 'Drop-in Visit', 'Overnight Care', 
        'Plant Watering', 'Mail Collection', 'Day Care'
    ]
    for opt in sit_options:
        ServiceOption.objects.get_or_create(category=categories['pet_sitting'], name=opt)

    print("✓ Ensured Service Options exist for all categories")

    print("\nDefault data population complete!")

if __name__ == '__main__':
    populate_defaults()
