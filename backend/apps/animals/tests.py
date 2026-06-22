"""
PetCarePlus v2 — Animals App Unit Tests

Tests covering AnimalType list, Guideline list/filter/search,
VaccinationRecord list/filter/search, and bilingual translations.
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.animals.models import AnimalType, Guideline, VaccinationRecord


class AnimalsAPITests(APITestCase):
    """
    Tests for animals, guidelines, and vaccination record endpoints.
    """

    def setUp(self):
        # Create animal types
        self.cat_type = AnimalType.objects.create(
            name_en='Cat',
            name_bn='বিড়াল',
            slug='cat',
            category='companion',
            icon='cat',
            supports_rehoming=True,
            supports_services=True
        )
        self.cow_type = AnimalType.objects.create(
            name_en='Cow',
            name_bn='গরু',
            slug='cow',
            category='livestock',
            icon='cow',
            supports_rehoming=False,
            supports_services=False
        )

        # Create guidelines
        self.guideline_summer_cat = Guideline.objects.create(
            animal_type=self.cat_type,
            title_en='Cat Summer Care',
            title_bn='বিড়ালের গরমের যত্ন',
            content_en='Keep your cat hydrated during hot summer days.',
            content_bn='গরমের দিনে আপনার বিড়ালকে পর্যাপ্ত পানি খাওয়ান।',
            summary_en='Summer hydration tips',
            summary_bn='গরমে পানি খাওয়ানোর টিপস',
            topic='health',
            season='summer',
            is_published=True
        )
        self.guideline_general_cow = Guideline.objects.create(
            animal_type=self.cow_type,
            title_en='Cow General Feeding',
            title_bn='গরুর সাধারণ খাদ্য',
            content_en='Feed high quality grass.',
            content_bn='উন্নত মানের ঘাস খাওয়ান।',
            summary_en='Feeding guide',
            summary_bn='খাদ্য সহায়িকা',
            topic='feeding',
            season='all',
            is_published=True
        )

        # Create vaccination record
        self.rabies_cat = VaccinationRecord.objects.create(
            animal_type=self.cat_type,
            vaccine_name_en='Rabies Vaccine',
            vaccine_name_bn='রেবিস ভ্যাকসিন',
            disease_en='Rabies',
            disease_bn='জলাতঙ্ক',
            schedule_en='Administer at 12 weeks, booster annually.',
            schedule_bn='১২ সপ্তাহে প্রথম ডোজ, প্রতি বছর বুস্টার।',
            dosage='1 ml',
            age_range='3 months+',
            local_medicine_name='Rabisin'
        )

        self.animal_list_url = reverse('animaltype-list')
        self.guideline_list_url = reverse('guideline-list')
        self.vaccination_list_url = reverse('vaccination-list')

    def test_list_animal_types(self):
        """Test public retrieval of animal types."""
        response = self.client.get(self.animal_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results should be inside 'results' due to standard pagination
        self.assertIn('results', response.data)
        results = response.data['results']
        self.assertEqual(len(results), 2)
        
        # Verify billing translation maps default to Bangla or Accept-Language
        self.assertEqual(results[0]['slug'], 'cat')
        self.assertEqual(results[0]['name'], 'বিড়াল')  # Default is 'bn'

    def test_list_animal_types_bilingual_header(self):
        """Test animal types response changes language based on Accept-Language header."""
        response = self.client.get(self.animal_list_url, HTTP_ACCEPT_LANGUAGE='en')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(results[0]['name'], 'Cat')  # Matches 'name_en'

    def test_list_guidelines_filter_and_search(self):
        """Test listing, filtering, and searching care guidelines."""
        # Retrieve all published guidelines (2)
        response = self.client.get(self.guideline_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

        # Filter by animal_type id
        response = self.client.get(self.guideline_list_url, {'animal_type': self.cat_type.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'বিড়ালের গরমের যত্ন')

        # Filter by season
        response = self.client.get(self.guideline_list_url, {'season': 'summer'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        # Search by English content
        response = self.client.get(self.guideline_list_url, {'search': 'hydrated'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        # Search by Bangla content
        response = self.client.get(self.guideline_list_url, {'search': 'ঘাস'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'গরুর সাধারণ খাদ্য')

    def test_guideline_detail_bilingual_preference(self):
        """Test guidelines details response matches user's preferred language."""
        user = User.objects.create_user(
            email='user@test.com',
            password='password123',
            preferred_language='en'
        )
        self.client.force_authenticate(user=user)

        detail_url = reverse('guideline-detail', args=[self.guideline_summer_cat.id])
        response = self.client.get(detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Verify preferred language fields are selected
        self.assertEqual(response.data['title'], 'Cat Summer Care')
        self.assertEqual(response.data['content'], 'Keep your cat hydrated during hot summer days.')

    def test_list_vaccination_records_filter_and_search(self):
        """Test listing, filtering, and searching vaccination records."""
        # List all records
        response = self.client.get(self.vaccination_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        # Filter by animal_type
        response = self.client.get(self.vaccination_list_url, {'animal_type': self.cow_type.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 0)  # No vaccines for cow yet

        # Search local medicine brand
        response = self.client.get(self.vaccination_list_url, {'search': 'Rabisin'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
