import os
import django
import sys

# Set up Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PetCarePlus.settings')
django.setup()

from apps.users.models import User

def run_test():
    print("Testing profile completion logic...")
    # Cleanup
    if User.objects.filter(email='test_missing@example.com').exists():
        User.objects.get(email='test_missing@example.com').delete()

    # Test
    user = User.objects.create_user(email='test_missing@example.com', password='password123')
    print(f"Missing fields initially: {user.missing_profile_fields}")

    # Update
    user.first_name = 'Test'
    user.last_name = 'User'
    user.phone_number = '1234567890'
    user.location_city = 'City'
    user.location_state = 'State'
    user.location_country = 'Country'
    # user.date_of_birth is still missing
    user.save()

    print(f"Missing fields after update: {user.missing_profile_fields}")

    if 'date_of_birth' in user.missing_profile_fields and 'phone_number' not in user.missing_profile_fields and 'location_country' not in user.missing_profile_fields:
        print("SUCCESS: Logic verified")
    else:
        print("FAILURE: Logic incorrect")

    # Cleanup
    user.delete()

if __name__ == "__main__":
    run_test()
