import os
import django
import sys

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PetCarePlus.settings')
django.setup()

from apps.services.models import ServiceCategory, ServiceOption, Species, Specialization
from apps.pets.models import PersonalityTrait

def verify_data():
    print("Verifying database data...")
    
    species_count = Species.objects.count()
    category_count = ServiceCategory.objects.count()
    trait_count = PersonalityTrait.objects.count()
    option_count = ServiceOption.objects.count()
    spec_count = Specialization.objects.count()
    
    print(f"Species Count: {species_count}")
    print(f"Categories Count: {category_count}")
    print(f"Traits Count: {trait_count}")
    print(f"Service Options Count: {option_count}")
    print(f"Specializations Count: {spec_count}")

    if species_count > 0 and category_count > 0 and trait_count > 0 and spec_count > 0:
        print("VERIFICATION SUCCESSFUL")
    else:
        print("VERIFICATION FAILED")

if __name__ == '__main__':
    verify_data()
