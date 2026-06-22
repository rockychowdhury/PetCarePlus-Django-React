"""
PetCarePlus v2 — Service Providers App Unit Tests

Tests covering provider profile creation, companion-only animal validation,
regional cascade search, and nested service CRUD with soft-deletes.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.animals.models import AnimalType
from apps.providers.models import ServiceProvider, ProviderService, ProviderAnimalType

User = get_user_model()


class ProvidersAPITests(APITestCase):
    """
    Tests for ServiceProvider and ProviderService API endpoints.
    """

    def setUp(self):
        # Create animal types
        self.cat_type = AnimalType.objects.create(
            name_en='Cat', name_bn='বিড়াল', slug='cat',
            category='companion', icon='cat',
            supports_rehoming=True, supports_services=True
        )
        self.cow_type = AnimalType.objects.create(
            name_en='Cow', name_bn='গরু', slug='cow',
            category='livestock', icon='cow',
            supports_rehoming=False, supports_services=False
        )

        # Create users
        self.provider_user = User.objects.create_user(
            email='vet1@petcareplus.com',
            password='password123',
            first_name='Dr. Rocky',
            last_name='Chowdhury',
            role='provider',
            division='dhaka',
            district='Dhaka'
        )
        self.pet_owner_user = User.objects.create_user(
            email='owner@test.com',
            password='password123',
            first_name='Rocky',
            last_name='Owner',
            role='pet_owner',
            division='dhaka',
            district='Dhaka'
        )

        # URLs
        self.provider_list_url = reverse('serviceprovider-list')

    def test_create_provider_profile_success(self):
        """Test successful provider profile creation and linking animal types."""
        self.client.force_authenticate(user=self.provider_user)

        payload = {
            'business_name': 'Rocky Vet Clinic',
            'description_en': 'Expert pet care services.',
            'description_bn': 'অভিজ্ঞ পোষা প্রাণী চিকিৎসা সেবা।',
            'provider_type': 'vet',
            'division': 'dhaka',
            'district': 'Dhaka',
            'upazila': 'Gulshan',
            'phone': '01712345678',
            'email': 'clinic@rockyvet.com',
            'animal_type_ids': [self.cat_type.id]
        }

        response = self.client.post(self.provider_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['business_name'], 'Rocky Vet Clinic')
        self.assertFalse(response.data['is_verified'])  # Must start as unverified

        # Check linked animal type in database
        provider = ServiceProvider.objects.get(user=self.provider_user)
        self.assertTrue(ProviderAnimalType.objects.filter(provider=provider, animal_type=self.cat_type).exists())

    def test_create_provider_profile_fails_for_non_provider_role(self):
        """Test that a user with role='pet_owner' cannot create a provider profile."""
        self.client.force_authenticate(user=self.pet_owner_user)

        payload = {
            'business_name': 'Rocky Vet Clinic',
            'provider_type': 'vet',
            'division': 'dhaka',
            'district': 'Dhaka',
            'phone': '01712345678'
        }

        response = self.client.post(self.provider_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_provider_profile_companion_validation(self):
        """Test that linking a livestock animal type (e.g. Cow) to services fails."""
        self.client.force_authenticate(user=self.provider_user)

        payload = {
            'business_name': 'Rocky Farm Services',
            'provider_type': 'vet',
            'division': 'dhaka',
            'district': 'Dhaka',
            'phone': '01712345678',
            'animal_type_ids': [self.cow_type.id]  # Reject livestock
        }

        response = self.client.post(self.provider_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('animal_type_ids', response.data)

    def test_nested_service_crud_and_soft_delete(self):
        """Test nesting /providers/:id/services/ endpoints for CRUD operations and soft-delete."""
        # Create provider profile
        provider = ServiceProvider.objects.create(
            user=self.provider_user,
            business_name='Rocky Vet Clinic',
            provider_type='vet',
            division='dhaka',
            district='Dhaka',
            phone='01712345678',
            is_verified=True
        )

        self.client.force_authenticate(user=self.provider_user)
        nested_url = reverse('provider-services-list', args=[provider.id])

        # 1. Create a service
        service_payload = {
            'name_en': 'General Checkup',
            'name_bn': 'সাধারণ চেকআপ',
            'price': '500.00',
            'duration_minutes': 30
        }
        response = self.client.post(nested_url, service_payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['price'], '500.00')
        service_id = response.data['id']

        # 2. Update service
        detail_url = reverse('provider-services-detail', args=[provider.id, service_id])
        update_payload = {
            'price': '600.00'
        }
        response = self.client.patch(detail_url, update_payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['price'], '600.00')


        # 3. Soft-delete service (should set is_active=False instead of hard deleting)
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify in database
        service = ProviderService.objects.get(id=service_id)
        self.assertFalse(service.is_active)
