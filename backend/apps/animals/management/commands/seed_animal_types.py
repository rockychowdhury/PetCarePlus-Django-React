"""
Management command to seed the 8 supported animal types.
Run: python manage.py seed_animal_types
"""

from django.core.management.base import BaseCommand
from apps.animals.models import AnimalType


ANIMAL_TYPES = [
    # Tier 1 — Companion pets (full platform support)
    {
        'name_en': 'Cat',
        'name_bn': 'বিড়াল',
        'slug': 'cat',
        'category': 'companion',
        'icon': 'cat',
        'supports_rehoming': True,
        'supports_services': True,
    },
    {
        'name_en': 'Dog',
        'name_bn': 'কুকুর',
        'slug': 'dog',
        'category': 'companion',
        'icon': 'dog',
        'supports_rehoming': True,
        'supports_services': True,
    },
    {
        'name_en': 'Rabbit',
        'name_bn': 'খরগোশ',
        'slug': 'rabbit',
        'category': 'companion',
        'icon': 'rabbit',
        'supports_rehoming': False,
        'supports_services': True,
    },
    {
        'name_en': 'Bird',
        'name_bn': 'পাখি',
        'slug': 'bird',
        'category': 'companion',
        'icon': 'bird',
        'supports_rehoming': False,
        'supports_services': True,
    },

    # Tier 2 — Livestock (information only)
    {
        'name_en': 'Cow',
        'name_bn': 'গরু',
        'slug': 'cow',
        'category': 'livestock',
        'icon': 'beef',
        'supports_rehoming': False,
        'supports_services': False,
    },
    {
        'name_en': 'Goat',
        'name_bn': 'ছাগল',
        'slug': 'goat',
        'category': 'livestock',
        'icon': 'goat',
        'supports_rehoming': False,
        'supports_services': False,
    },
    {
        'name_en': 'Chicken',
        'name_bn': 'মুরগি',
        'slug': 'chicken',
        'category': 'livestock',
        'icon': 'egg',
        'supports_rehoming': False,
        'supports_services': False,
    },
    {
        'name_en': 'Duck',
        'name_bn': 'হাঁস',
        'slug': 'duck',
        'category': 'livestock',
        'icon': 'duck',
        'supports_rehoming': False,
        'supports_services': False,
    },
]


class Command(BaseCommand):
    help = 'Seed the 8 supported animal types (4 companion + 4 livestock)'

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for data in ANIMAL_TYPES:
            obj, created = AnimalType.objects.update_or_create(
                slug=data['slug'],
                defaults=data,
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  + Created: {obj.name_en} ({obj.name_bn})'))
            else:
                updated_count += 1
                self.stdout.write(f'  ○ Updated: {obj.name_en} ({obj.name_bn})')

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Done! {created_count} created, {updated_count} updated. '
            f'Total animal types: {AnimalType.objects.count()}'
        ))
