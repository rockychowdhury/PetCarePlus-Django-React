"""
Management command to seed sample vaccination records.
Run: python manage.py seed_vaccination_records
"""

from django.core.management.base import BaseCommand
from apps.animals.models import AnimalType, VaccinationRecord


SAMPLE_VACCINES = [
    {
        'animal_slug': 'dog',
        'vaccine_name_en': 'Rabies (Anti-Rabies)',
        'vaccine_name_bn': 'রেবিস (জলাতঙ্ক)',
        'disease_en': 'Rabies virus infection',
        'disease_bn': 'জলাতঙ্ক রোগ',
        'schedule_en': 'First dose at 12-16 weeks of age. Booster every 1-3 years.',
        'schedule_bn': '১২-১৬ সপ্তাহ বয়সে প্রথম ডোজ। প্রতি ১-৩ বছর পর পর বুস্টার।',
        'dosage': '1 ml SQ/IM',
        'age_range': '3+ months',
        'local_medicine_name': 'Rabisin, Nobivac RL',
    },
    {
        'animal_slug': 'cat',
        'vaccine_name_en': 'FVRCP (Core)',
        'vaccine_name_bn': 'এফভিআরসিপি (কোর)',
        'disease_en': 'Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia',
        'disease_bn': 'বিড়ালের ভাইরাল রাইনোট্র্যাকিটিস, ক্যালিসিভাইরাস, প্যানলিউকোপেনিয়া',
        'schedule_en': 'Start at 6-8 weeks, repeat every 3-4 weeks until 16 weeks.',
        'schedule_bn': '৬-৮ সপ্তাহ থেকে শুরু, ১৬ সপ্তাহ না হওয়া পর্যন্ত ৩-৪ সপ্তাহ পর পর।',
        'dosage': '1 dose SQ',
        'age_range': '6+ weeks',
        'local_medicine_name': 'Nobivac Tricat Trio, Biofel PCHR',
    },
    {
        'animal_slug': 'cow',
        'vaccine_name_en': 'FMD (Foot and Mouth Disease)',
        'vaccine_name_bn': 'খুরা রোগ (FMD)',
        'disease_en': 'Foot and Mouth Disease',
        'disease_bn': 'খুরা রোগ',
        'schedule_en': 'First dose at 3-4 months, booster after 1 month, then twice a year.',
        'schedule_bn': '৩-৪ মাস বয়সে প্রথম ডোজ, ১ মাস পর বুস্টার, তারপর বছরে দুইবার।',
        'dosage': '2 ml deep IM',
        'age_range': '3+ months',
        'local_medicine_name': 'Raksha Ovac, FMD Vaccine (LRI)',
    }
]


class Command(BaseCommand):
    help = 'Seed sample vaccination records'

    def handle(self, *args, **options):
        created_count = 0

        for data in SAMPLE_VACCINES:
            try:
                animal = AnimalType.objects.get(slug=data.pop('animal_slug'))
                _, created = VaccinationRecord.objects.get_or_create(
                    animal_type=animal,
                    vaccine_name_en=data['vaccine_name_en'],
                    defaults=data,
                )
                if created:
                    created_count += 1
                    self.stdout.write(self.style.SUCCESS(f"  + Created: {data['vaccine_name_en']}"))
            except AnimalType.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"  - Animal type not found"))

        self.stdout.write(self.style.SUCCESS(f'Done! {created_count} vaccination records seeded.'))
