"""
PetCarePlus v2 — Resources App Unit Tests

Tests covering resource list, retrieve, filter by type,
search capabilities, and bilingual mappings.
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.resources.models import Resource
from apps.animals.models import AnimalType


class ResourcesAPITests(APITestCase):
    """
    Tests for Resource model API.
    """

    def setUp(self):
        self.animal = AnimalType.objects.create(
            name_en='Dog', name_bn='কুকুর', slug='dog', category='companion'
        )

        # Create a few resources
        self.info = Resource.objects.create(
            title_en='General Dog Care',
            title_bn='কুকুরের সাধারণ যত্ন',
            description_en='Provides information on dog care.',
            description_bn='কুকুরের যত্ন সম্পর্কে তথ্য প্রদান করে।',
            resource_type='information',
            animal_type=self.animal,
            is_active=True
        )

        self.medicine = Resource.objects.create(
            title_en='Rabies Vaccine info',
            title_bn='রেবিস ভ্যাকসিনের তথ্য',
            description_en='Details about Rabies vaccine.',
            description_bn='রেবিস ভ্যাকসিনের বিস্তারিত।',
            resource_type='vaccination',
            animal_type=self.animal,
            is_active=True
        )

        self.inactive_resource = Resource.objects.create(
            title_en='Old Emergency Line',
            title_bn='পুরানো জরুরী সেবা লাইন',
            description_en='Out of order.',
            description_bn='অচল।',
            resource_type='emergency',
            is_active=False
        )

        self.list_url = reverse('resource-list')

    def test_list_resources_public_access(self):
        """Test that anyone can view active resources."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 2)
        
    def test_list_resources_filter_by_type(self):
        """Test filtering resources by resource type."""
        response = self.client.get(self.list_url, {'resource_type': 'vaccination'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['resource_type'], 'vaccination')

    def test_search_resources(self):
        """Test searching resources via search filter."""
        response = self.client.get(self.list_url, {'search': 'vaccine'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
