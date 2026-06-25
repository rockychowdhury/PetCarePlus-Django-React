import os
import sys
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

import django
django.setup()

from apps.providers.models import ServiceProvider
from apps.locations.models import Union

def update_unions():
    providers = ServiceProvider.objects.all()[:20]
    
    count = 0
    for provider in providers:
        if provider.upazila:
            # Fetch unions for the assigned upazila
            upazila_unions = list(Union.objects.filter(upazila=provider.upazila))
            if upazila_unions:
                provider.union = random.choice(upazila_unions)
                provider.save()
                count += 1
        
    print(f"Updated {count} providers with a random Union based on their assigned Upazila.")

if __name__ == "__main__":
    update_unions()
