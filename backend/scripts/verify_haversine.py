import os
import django
import sys

sys.path.append('/home/rocky/Projects/PetCarePlus-Django-React/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PetCarePlus.settings')
django.setup()

from apps.common.utils import annotated_distance_queryset
from apps.services.models import ServiceProvider
from apps.users.models import User

def verify():
    # Create some dummy data if needed, or query existing
    # Let's create a user at a known location
    print("Creating test user...")
    try:
        user = User.objects.create(email='test_geo@example.com', latitude=40.7128, longitude=-74.0060) # NYC
    except Exception:
        user = User.objects.get(email='test_geo@example.com')
        user.latitude = 40.7128
        user.longitude = -74.0060
        user.save()

    # Query with distance from standard point (e.g. Philadelphia ~130km away)
    # Philly: 39.9526, -75.1652
    
    qs = User.objects.filter(email='test_geo@example.com')
    annotated = annotated_distance_queryset(qs, 39.9526, -75.1652)
    
    first = annotated.first()
    if first:
        print(f"User: {first.email}")
        print(f"Calculated Distance: {first.distance} km")
        # Expected ~130-140km
        if 130 < first.distance < 140:
             print("SUCCESS: Distance is within expected range.")
        else:
             print("FAILURE: Distance is out of range.")
    else:
        print("No user found")

if __name__ == '__main__':
    verify()
