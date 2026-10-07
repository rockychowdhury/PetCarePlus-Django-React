"""
PetCarePlus v2 — Animals App Unit Tests

Tests covering the public AnimalType list endpoint and its bilingual
translation behaviour.

Note: care guidelines and vaccination reference data live in the resources
app (resource_type='guideline'/'vaccination') and are covered by
apps.resources.tests.
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.animals.models import AnimalType


class AnimalsAPITests(APITestCase):
    """
    Tests for the animal types endpoint.
    """

    def setUp(self):
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

        self.animal_list_url = reverse('animaltype-list')

    def test_list_animal_types(self):
        """Test public retrieval of animal types."""
        response = self.client.get(self.animal_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # The viewset is intentionally unpaginated (pagination_class = None)
        results = response.data
        self.assertEqual(len(results), 2)

        # Verify bilingual translation maps default to Bangla or Accept-Language
        self.assertEqual(results[0]['slug'], 'cat')
        self.assertEqual(results[0]['name'], 'বিড়াল')  # Default is 'bn'

    def test_list_animal_types_bilingual_header(self):
        """Test animal types response changes language based on Accept-Language header."""
        response = self.client.get(self.animal_list_url, HTTP_ACCEPT_LANGUAGE='en')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data
        self.assertEqual(results[0]['name'], 'Cat')  # Matches 'name_en'
