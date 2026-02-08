import os
import django
import sys

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PetCarePlus.settings')
django.setup()

from apps.rehoming.services.ai_service import generate_application_content
from apps.rehoming.models import RehomingListing
from apps.users.models import User

def test():
    try:
        user = User.objects.get(id=1)
        listing = RehomingListing.objects.first()
        if not listing:
             print("No listing found to test with.")
             return
             
        form_data = {
            "living_situation": {"home_type": "House", "ownership": "Owned", "household_members": "4"},
            "pet_history": {"previous_ownership": "yes"},
            "daily_care": {"routine": "Morning walks", "time_alone": "4 hours"}
        }
        
        print("Starting AI generation...")
        content = generate_application_content(user, listing, form_data)
        print("\nGenerated Content:")
        print(content)
        
        if "Dear" in content and listing.owner.first_name in content:
             if "I am interest in adopting" in content or "I have reviewed the profile" in content:
                  # Check if it's the fallback or real
                  # Fallback is: f"Dear {listing.owner.first_name},\n\nI am interested in adopting {listing.pet.name}..."
                  # Real should be more flowery.
                  print("\nVerification successful (Check if content looks AI-generated)")
             else:
                  print("\nContent looks potentially personalized.")
        else:
             print("\nContent did not meet format expectations.")
             
    except Exception as e:
        print(f"Error during verification: {e}")

if __name__ == "__main__":
    test()
