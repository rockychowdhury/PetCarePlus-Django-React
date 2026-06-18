import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.animals.models import AnimalType
from apps.rehoming.models import RehomingListing

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with sample rehoming listings for Dhaka and Brahmanbaria'

    def handle(self, *args, **kwargs):
        self.stdout.write("Starting to seed Rehoming Listings...")

        # Ensure we have users
        user1, _ = User.objects.get_or_create(
            email='dhaka_owner@example.com',
            defaults={
                'first_name': 'Dhaka',
                'last_name': 'Owner',
                'district': 'Dhaka',
                'latitude': 23.8103,
                'longitude': 90.4125,
            }
        )
        if not user1.check_password('password123'):
            user1.set_password('password123')
            user1.save()

        user2, _ = User.objects.get_or_create(
            email='brahmanbaria_owner@example.com',
            defaults={
                'first_name': 'Brahmanbaria',
                'last_name': 'Owner',
                'district': 'Brahmanbaria',
                'latitude': 23.9571,
                'longitude': 91.1119,
            }
        )
        if not user2.check_password('password123'):
            user2.set_password('password123')
            user2.save()

        # Ensure we have animal types
        cat_type = AnimalType.objects.filter(slug='cat').first()
        dog_type = AnimalType.objects.filter(slug='dog').first()

        if not cat_type or not dog_type:
            self.stdout.write(self.style.ERROR("Animal types 'cat' or 'dog' not found. Please run initial seeds for animals first."))
            return

        # Clear existing
        RehomingListing.objects.filter(
            pet_name__in=['Tommy', 'Milo', 'Luna', 'Max', 'Bella']
        ).delete()

        listings_data = [
            # Dhaka Listings
            {
                'pet_name': 'Tommy',
                'animal_type': dog_type,
                'owner': user1,
                'breed': 'Deshi',
                'gender': 'male',
                'weight_kg': 12.5,
                'spayed_neutered': True,
                'vaccinated': True,
                'district': 'Dhaka',
                'latitude': 23.8103,
                'longitude': 90.4125,
                'photo_url': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=400&q=80',
                'reason': 'Moving abroad for higher studies and cannot take Tommy with me.',
                'adopter_requirements': 'Must have prior experience with dogs. A home with a yard is preferred.'
            },
            {
                'pet_name': 'Luna',
                'animal_type': cat_type,
                'owner': user1,
                'breed': 'Persian Mix',
                'gender': 'female',
                'weight_kg': 4.2,
                'spayed_neutered': False,
                'vaccinated': True,
                'district': 'Dhaka',
                'latitude': 23.8200,
                'longitude': 90.4200,
                'photo_url': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&q=80',
                'reason': 'Family member developed severe asthma/allergies.',
                'adopter_requirements': 'Must keep her strictly indoors. She needs daily grooming.'
            },
            # Brahmanbaria Listings
            {
                'pet_name': 'Max',
                'animal_type': dog_type,
                'owner': user2,
                'breed': 'German Shepherd Mix',
                'gender': 'male',
                'weight_kg': 20.0,
                'spayed_neutered': True,
                'vaccinated': True,
                'district': 'Brahmanbaria',
                'latitude': 23.9571,
                'longitude': 91.1119,
                'photo_url': 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80',
                'reason': 'Not enough time to give Max the attention and exercise he needs.',
                'adopter_requirements': 'Needs an active family who can take him for long walks daily.'
            },
            {
                'pet_name': 'Bella',
                'animal_type': cat_type,
                'owner': user2,
                'breed': 'Deshi',
                'gender': 'female',
                'weight_kg': 3.5,
                'spayed_neutered': True,
                'vaccinated': True,
                'district': 'Brahmanbaria',
                'latitude': 23.9600,
                'longitude': 91.1200,
                'photo_url': 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&q=80',
                'reason': 'Found her abandoned, fostered her for a month but cannot keep long term.',
                'adopter_requirements': 'Looking for a loving and permanent home.'
            }
        ]

        for data in listings_data:
            listing = RehomingListing.objects.create(**data)
            self.stdout.write(f"Created listing: {listing.pet_name} in {listing.district}")

        self.stdout.write(self.style.SUCCESS('Successfully seeded Rehoming Listings!'))
