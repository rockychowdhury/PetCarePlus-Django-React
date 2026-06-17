import os
import sys
import django

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from apps.animals.models import AnimalType
from apps.providers.models import ServiceProvider, ProviderAnimalType

animals_data = [
    {'name_en': 'Dog', 'name_bn': 'কুকুর', 'slug': 'dog', 'category': 'mammal', 'supports_rehoming': True, 'supports_services': True},
    {'name_en': 'Cat', 'name_bn': 'বিড়াল', 'slug': 'cat', 'category': 'mammal', 'supports_rehoming': True, 'supports_services': True},
    {'name_en': 'Bird', 'name_bn': 'পাখি', 'slug': 'bird', 'category': 'bird', 'supports_rehoming': True, 'supports_services': True},
    {'name_en': 'Rabbit', 'name_bn': 'খরগোশ', 'slug': 'rabbit', 'category': 'mammal', 'supports_rehoming': True, 'supports_services': True},
    {'name_en': 'Fish', 'name_bn': 'মাছ', 'slug': 'fish', 'category': 'fish', 'supports_rehoming': False, 'supports_services': True},
    {'name_en': 'Cow', 'name_bn': 'গরু', 'slug': 'cow', 'category': 'mammal', 'supports_rehoming': False, 'supports_services': True},
    {'name_en': 'Goat', 'name_bn': 'ছাগল', 'slug': 'goat', 'category': 'mammal', 'supports_rehoming': False, 'supports_services': True},
    {'name_en': 'Turtle', 'name_bn': 'কচ্ছপ', 'slug': 'turtle', 'category': 'reptile', 'supports_rehoming': True, 'supports_services': True},
    {'name_en': 'Poultry', 'name_bn': 'হাঁস-মুরগি', 'slug': 'poultry', 'category': 'bird', 'supports_rehoming': False, 'supports_services': True},
    {'name_en': 'Guinea Pig', 'name_bn': 'গিনিপিগ', 'slug': 'guinea-pig', 'category': 'mammal', 'supports_rehoming': True, 'supports_services': True},
]

print("Seeding AnimalTypes...")
for a in animals_data:
    obj, created = AnimalType.objects.get_or_create(
        slug=a['slug'],
        defaults=a
    )
    if not created:
        for k, v in a.items():
            setattr(obj, k, v)
        obj.save()

print("Assigning Animals to Providers...")
providers = ServiceProvider.objects.all()
dogs = AnimalType.objects.get(slug='dog')
cats = AnimalType.objects.get(slug='cat')
birds = AnimalType.objects.get(slug='bird')
cows = AnimalType.objects.get(slug='cow')

for provider in providers:
    # Give everyone dog and cat
    ProviderAnimalType.objects.get_or_create(provider=provider, animal_type=dogs)
    ProviderAnimalType.objects.get_or_create(provider=provider, animal_type=cats)
    
    if provider.provider_type == 'vet':
        ProviderAnimalType.objects.get_or_create(provider=provider, animal_type=cows)
        ProviderAnimalType.objects.get_or_create(provider=provider, animal_type=birds)

print("Done seeding animals and mapping to providers.")
