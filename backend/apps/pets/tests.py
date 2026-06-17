"""
PetCarePlus v2 — Pets App Unit Tests

Tests covering companion-only validations, owner-only scoping,
and pet profile soft-deletes.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.animals.models import AnimalType
from apps.pets.models import Pet

User = get_user_model()


class PetsAPITests(APITestCase):
    """
    Tests for Pet API endpoints.
    """

    def setUp(self):
        # Create animal types
        self.cat_type = AnimalType.objects.create(
            name_en='Cat', name_bn='বিড়াল', slug='cat',
            category='companion', icon='cat', supports_services=True
        )
        self.cow_type = AnimalType.objects.create(
            name_en='Cow', name_bn='গরু', slug='cow',
            category='livestock', icon='cow', supports_services=False
        )

        # Create users
        self.user = User.objects.create_user(
            email='owner@test.com', password='password123',
            first_name='Rocky', last_name='Owner', role='pet_owner'
        )
        self.other_user = User.objects.create_user(
            email='other@test.com', password='password123',
            first_name='Other', last_name='Owner', role='pet_owner'
        )

        self.list_url = reverse('pet-list')

    def test_create_companion_pet_success(self):
        """Test registering a companion pet successfully."""
        self.client.force_authenticate(user=self.user)

        payload = {
            'animal_type': self.cat_type.id,
            'name': 'Milo',
            'breed': 'Persian',
            'gender': 'male',
            'weight_kg': '4.50'
        }

        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Milo')
        self.assertEqual(response.data['owner_email'], self.user.email)

    def test_create_livestock_pet_fails(self):
        """Test that registering a livestock animal (e.g. Cow) as a pet fails validation."""
        self.client.force_authenticate(user=self.user)

        payload = {
            'animal_type': self.cow_type.id,
            'name': 'Lola',
            'gender': 'female'
        }

        response = self.client.post(self.list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('animal_type', response.data)

    def test_pet_list_owner_scoping(self):
        """Test that users see only their own active pets."""
        # Create my pet
        my_pet = Pet.objects.create(
            owner=self.user,
            animal_type=self.cat_type,
            name='My Milo'
        )
        # Create other user pet
        other_pet = Pet.objects.create(
            owner=self.other_user,
            animal_type=self.cat_type,
            name='Other Simba'
        )

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], my_pet.id)

    def test_pet_soft_delete(self):
        """Test soft deleting a pet profile."""
        pet = Pet.objects.create(
            owner=self.user,
            animal_type=self.cat_type,
            name='Milo'
        )

        self.client.force_authenticate(user=self.user)
        detail_url = reverse('pet-detail', args=[pet.id])
        
        response = self.client.delete(detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        # Verify in database (is_active should be set to False)
        pet.refresh_from_db()
        self.assertFalse(pet.is_active)
