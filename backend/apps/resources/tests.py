"""
PetCarePlus v2 — Government Resources App Unit Tests

Tests covering resource list, retrieve, filter by division/district/type,
search capabilities, and bilingual mappings.
"""

from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.resources.models import GovtResource


class ResourcesAPITests(APITestCase):
    """
    Tests for government and NGO resources API.
    """

    def setUp(self):
        # Create a few resources
        self.dhaka_govt = GovtResource.objects.create(
            name_en='Dhaka Veterinary Hospital',
            name_bn='ঢাকা পশু হাসপাতাল',
            description_en='Provides free treatments for livestock and pets.',
            description_bn='গবাদি পশু এবং পোষা প্রাণীর জন্য বিনামূল্যে চিকিৎসা সেবা প্রদান করে।',
            resource_type='govt',
            division='dhaka',
            district='Dhaka',
            phone='02-9876543',
            email='info@dhakavethosp.gov.bd',
            website='http://dhakavethosp.gov.bd',
            address_en='45 Bijoy Sarani, Dhaka',
            address_bn='৪৫ বিজয় সরণি, ঢাকা',
            is_active=True
        )

        self.chittagong_ngo = GovtResource.objects.create(
            name_en='Ctg Animal Rescue NGO',
            name_bn='চট্টগ্রাম এনিমেল রেসকিউ এনজিও',
            description_en='Rescues stray dogs and cats.',
            description_bn='রাস্তার কুকুর এবং বিড়াল উদ্ধার করে থাকে।',
            resource_type='ngo',
            division='chattogram',
            district='Chittagong',
            phone='01812345678',
            email='rescue@ctganimal.org',
            website='http://ctganimal.org',
            address_en='GEC Circle, Chittagong',
            address_bn='জিইসি মোড়, চট্টগ্রাম',
            is_active=True
        )

        self.inactive_resource = GovtResource.objects.create(
            name_en='Old Emergency Line',
            name_bn='পুরানো জরুরী সেবা লাইন',
            description_en='Out of order.',
            description_bn='অচল।',
            resource_type='emergency',
            division='dhaka',
            district='Dhaka',
            is_active=False
        )

        self.list_url = reverse('govtresource-list')

    def test_list_resources_public_access(self):
        """Test that anyone can view active government resources."""
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Results should be inside 'results' due to pagination
        results = response.data['results']
        # Active resources only (dhaka_govt and chittagong_ngo = 2)
        self.assertEqual(len(results), 2)
        
        # Verify default Bangla translation for first resource (Chattogram sorted alphabetically by default meta)
        # Let's check which is returned
        names = [r['name'] for r in results]
        self.assertIn('ঢাকা পশু হাসপাতাল', names)
        self.assertIn('চট্টগ্রাম এনিমেল রেসকিউ এনজিও', names)

    def test_list_resources_filter_by_division_and_district(self):
        """Test filtering resources by division and district."""
        # Filter by division = chattogram
        response = self.client.get(self.list_url, {'division': 'chattogram'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['district'], 'Chittagong')

        # Filter by division = dhaka
        response = self.client.get(self.list_url, {'division': 'dhaka'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['district'], 'Dhaka')

    def test_list_resources_filter_by_type(self):
        """Test filtering resources by resource type."""
        response = self.client.get(self.list_url, {'resource_type': 'ngo'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['resource_type'], 'ngo')

    def test_search_resources(self):
        """Test searching resources via search filter."""
        # Search english description
        response = self.client.get(self.list_url, {'search': 'free treatments'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['district'], 'Dhaka')

        # Search bangla name
        response = self.client.get(self.list_url, {'search': 'রেসকিউ'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['district'], 'Chittagong')
