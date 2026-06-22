import os
import sys
import django
import random

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.resources.models import Resource
from apps.animals.models import AnimalType

def seed_resources():
    print("Seeding resources...")
    # Clean existing for idempotency
    Resource.objects.all().delete()
    
    # Try to get some animal types
    dog = AnimalType.objects.filter(slug='dog').first()
    cat = AnimalType.objects.filter(slug='cat').first()
    cow = AnimalType.objects.filter(slug='cow').first()
    
    resources_data = [
        {
            "title_en": "Dhaka Central Veterinary Hospital",
            "title_bn": "ঢাকা সেন্ট্রাল ভেটেরিনারি হাসপাতাল",
            "description_en": "Government veterinary hospital providing free and subsidized treatments.",
            "description_bn": "সরকারি ভেটেরিনারি হাসপাতাল যা বিনামূল্যে এবং ভর্তুকি মূল্যে চিকিৎসা প্রদান করে।",
            "resource_type": "govt",
            "animal_type": None,
            "is_active": True
        },
        {
            "title_en": "Obhoyaronno - Bangladesh Animal Welfare Foundation",
            "title_bn": "অভয়ারণ্য - বাংলাদেশ প্রাণী কল্যাণ ফাউন্ডেশন",
            "description_en": "NGO focusing on rabies vaccination and CNVR (Catch-Neuter-Vaccinate-Return) for street dogs.",
            "description_bn": "রাস্তার কুকুরদের জন্য রেবিস ভ্যাকসিন এবং CNVR এর উপর কাজ করা এনজিও।",
            "resource_type": "vaccination",
            "animal_type": dog,
            "is_active": True
        },
        {
            "title_en": "Care for Paws Shelter",
            "title_bn": "কেয়ার ফর পজ শেল্টার",
            "description_en": "Provides shelter and food for injured and homeless street animals.",
            "description_bn": "আহত এবং গৃহহীন রাস্তার প্রাণীদের জন্য আশ্রয় এবং খাবার সরবরাহ করে।",
            "resource_type": "shelter",
            "animal_type": None,
            "is_active": True
        },
        {
            "title_en": "Livestock Emergency Line",
            "title_bn": "গবাদি পশু জরুরি লাইন",
            "description_en": "Emergency contact for sudden outbreak of diseases in livestock.",
            "description_bn": "গবাদি পশুতে হঠাৎ রোগ প্রাদুর্ভাবের জন্য জরুরি যোগাযোগ।",
            "resource_type": "emergency",
            "animal_type": cow,
            "is_active": True
        },
        {
            "title_en": "Animal Food Bank BD",
            "title_bn": "অ্যানিমেল ফুড ব্যাংক বিডি",
            "description_en": "Distributes food for stray dogs and cats during crises.",
            "description_bn": "সঙ্কটকালীন সময়ে রাস্তার কুকুর এবং বিড়ালের জন্য খাবার বিতরণ করে।",
            "resource_type": "food",
            "animal_type": None,
            "is_active": True
        },
        {
            "title_en": "Feline Panleukopenia Information",
            "title_bn": "ফেলাইন প্যানলিউকোপেনিয়া তথ্য",
            "description_en": "Comprehensive guide on preventing and identifying feline panleukopenia virus.",
            "description_bn": "ফেলাইন প্যানলিউকোপেনিয়া ভাইরাস প্রতিরোধ এবং সনাক্তকরণের জন্য বিস্তারিত গাইড।",
            "resource_type": "diseases",
            "animal_type": cat,
            "is_active": True
        },
        {
            "title_en": "Pet Medicine Pharmacy - Gulshan",
            "title_bn": "পোষা প্রাণীর ওষুধের ফার্মেসি - গুলশান",
            "description_en": "24/7 pharmacy supplying imported pet medicines and supplements.",
            "description_bn": "24/7 ফার্মেসি যা আমদানিকৃত পোষা প্রাণীর ওষুধ সরবরাহ করে।",
            "resource_type": "medicine",
            "animal_type": None,
            "is_active": True
        },
        {
            "title_en": "National Rabies Control Program",
            "title_bn": "জাতীয় জলাতঙ্ক নিয়ন্ত্রণ কর্মসূচি",
            "description_en": "Government initiative for mass dog vaccination against rabies.",
            "description_bn": "জলাতঙ্কের বিরুদ্ধে কুকুরের গণ টিকাদানের জন্য সরকারি উদ্যোগ।",
            "resource_type": "vaccination",
            "animal_type": dog,
            "is_active": True
        },
        {
            "title_en": "Stray Cat Rescue Information",
            "title_bn": "রাস্তার বিড়াল উদ্ধার তথ্য",
            "description_en": "Guidelines on how to safely rescue and foster stray kittens.",
            "description_bn": "কীভাবে নিরাপদে রাস্তার বিড়ালছানা উদ্ধার এবং লালন-পালন করবেন তার নির্দেশিকা।",
            "resource_type": "information",
            "animal_type": cat,
            "is_active": True
        },
        {
            "title_en": "Sylhet Animal Rescue Team",
            "title_bn": "সিলেট অ্যানিমাল রেসকিউ টিম",
            "description_en": "Volunteer emergency team rescuing trapped or injured animals in Sylhet.",
            "description_bn": "সিলেটে আটকা পড়া বা আহত প্রাণীদের উদ্ধারের জন্য স্বেচ্ছাসেবক জরুরি দল।",
            "resource_type": "emergency",
            "animal_type": None,
            "is_active": True
        }
    ]

    for item_data in resources_data:
        animal_type = item_data.pop('animal_type', None)
        resource = Resource.objects.create(**item_data)
        if animal_type:
            resource.animal_types.add(animal_type)
        else:
            if dog: resource.animal_types.add(dog)
            if cat: resource.animal_types.add(cat)
        
    print(f"Successfully seeded {len(resources_data)} resources.")

if __name__ == '__main__':
    seed_resources()
