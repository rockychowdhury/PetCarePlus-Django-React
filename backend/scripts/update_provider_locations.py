import os
import sys
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

import django
django.setup()

from apps.providers.models import ServiceProvider
from apps.locations.models import Division, District, Upazila

def update_locations():
    dhaka_div = Division.objects.filter(name_en__iexact="Dhaka").first()
    dhaka_dist = District.objects.filter(name_en__iexact="Dhaka").first()
    
    if not dhaka_div or not dhaka_dist:
        print("Dhaka division or district not found in the DB.")
        return

    dhaka_upazilas = list(Upazila.objects.filter(district=dhaka_dist))
    
    if not dhaka_upazilas:
        print("No upazilas found for Dhaka district.")
        return

    providers = ServiceProvider.objects.all()[:20]
    
    base_lat = 23.78746311069398
    base_lon = 90.34812469090427
    
    count = 0
    for provider in providers:
        # Add a tiny random offset to lat/lon to spread them out slightly around the base location
        lat_offset = random.uniform(-0.03, 0.03)
        lon_offset = random.uniform(-0.03, 0.03)
        
        provider.division = dhaka_div
        provider.district = dhaka_dist
        provider.upazila = random.choice(dhaka_upazilas)
        
        provider.latitude = base_lat + lat_offset
        provider.longitude = base_lon + lon_offset
        
        provider.save()
        count += 1
        
    print(f"Updated {count} providers successfully with Dhaka locations and GPS coordinates near {base_lat}, {base_lon}.")

if __name__ == "__main__":
    update_locations()
