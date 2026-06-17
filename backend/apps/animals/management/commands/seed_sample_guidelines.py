"""
Management command to seed sample guidelines.
Run: python manage.py seed_sample_guidelines
"""

from django.core.management.base import BaseCommand
from apps.animals.models import AnimalType, Guideline

SAMPLE_GUIDELINES = [
    {
        'animal_slug': 'cat',
        'title_en': 'Basic Cat Nutrition Guide',
        'title_bn': 'বিড়ালের মৌলিক পুষ্টি নির্দেশিকা',
        'content_en': 'Cats are obligate carnivores. This means they rely on nutrients found only in animal products...',
        'content_bn': 'বিড়াল মাংসাশী প্রাণী। এর মানে হলো তারা এমন পুষ্টির উপর নির্ভর করে যা শুধুমাত্র প্রাণীজ খাবারে পাওয়া যায়...',
        'topic': 'feeding',
        'season': 'all',
    },
    {
        'animal_slug': 'cow',
        'title_en': 'Summer Heat Stress Management',
        'title_bn': 'গ্রীষ্মের গরমে গরুর যত্ন',
        'content_en': 'Provide adequate shade and unlimited clean drinking water during summer months...',
        'content_bn': 'গ্রীষ্মের মাসগুলোতে পর্যাপ্ত ছায়া এবং সীমাহীন পরিষ্কার পানীয় জলের ব্যবস্থা করুন...',
        'topic': 'health',
        'season': 'summer',
    },
    {
        'animal_slug': 'dog',
        'title_en': 'Puppy Training Basics',
        'title_bn': 'কুকুরছানা প্রশিক্ষণের প্রাথমিক ধাপ',
        'content_en': 'Start with basic commands like sit, stay, and come. Use positive reinforcement...',
        'content_bn': 'বসা, থাকা এবং আসার মতো মৌলিক কমান্ড দিয়ে শুরু করুন। ইতিবাচক রিইনফোর্সমেন্ট ব্যবহার করুন...',
        'topic': 'training',
        'season': 'all',
    }
]


class Command(BaseCommand):
    help = 'Seed sample guidelines for development/demo'

    def handle(self, *args, **options):
        created_count = 0

        for data in SAMPLE_GUIDELINES:
            try:
                animal = AnimalType.objects.get(slug=data.pop('animal_slug'))
                _, created = Guideline.objects.get_or_create(
                    animal_type=animal,
                    title_en=data['title_en'],
                    defaults=data,
                )
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"  + Created: {data['title_en']}"))
            except AnimalType.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"  - Animal type not found for guideline"))

        self.stdout.write(self.style.SUCCESS(f'Done! {created_count} guidelines seeded.'))
