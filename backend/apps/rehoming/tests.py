"""
PetCarePlus v2 — Rehoming App Unit Tests

Tests covering RehomingListings (validations, regional scoping) and
RehomingApplications (self-adoption locks, approval lifecycle transactions).
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.animals.models import AnimalType
from apps.pets.models import Pet
from apps.rehoming.models import RehomingListing, RehomingApplication

User = get_user_model()


class RehomingAPITests(APITestCase):
    """
    Tests for Rehoming listings and adoption application endpoints.
    """

    def setUp(self):
        # Create animal types
        self.dog_type = AnimalType.objects.create(
            name_en='Dog', name_bn='কুকুর', slug='dog',
            category='companion', icon='dog', supports_rehoming=True
        )
        self.rabbit_type = AnimalType.objects.create(
            name_en='Rabbit', name_bn='খরগোশ', slug='rabbit',
            category='companion', icon='rabbit', supports_rehoming=False
        )

        # Create users
        self.owner = User.objects.create_user(
            email='owner@test.com', password='password123',
            first_name='Rocky', last_name='Owner', role='pet_owner',
            division='dhaka', district='Dhaka'
        )
        self.applicant = User.objects.create_user(
            email='applicant@test.com', password='password123',
            first_name='Adopter', last_name='Rocky', role='pet_owner',
            division='dhaka', district='Dhaka'
        )
        self.other_applicant = User.objects.create_user(
            email='other@test.com', password='password123',
            first_name='Adopter2', last_name='Rocky', role='pet_owner',
            division='chattogram', district='Chittagong'
        )

        # Create pets
        self.my_dog = Pet.objects.create(
            owner=self.owner, animal_type=self.dog_type, name='Buddy'
        )
        self.my_rabbit = Pet.objects.create(
            owner=self.owner, animal_type=self.rabbit_type, name='Bugs'
        )

        # URLs
        self.listing_list_url = reverse('rehominglisting-list')
        self.app_list_url = reverse('rehomingapplication-list')

    def test_create_rehoming_listing_dog_success(self):
        """Test successful rehoming listing for an eligible animal type (Dog)."""
        self.client.force_authenticate(user=self.owner)

        payload = {
            'pet': self.my_dog.id,
            'reason': 'Moving abroad'
        }

        response = self.client.post(self.listing_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'active')

    def test_create_rehoming_listing_rabbit_fails(self):
        """Test that rehoming listings for non-eligible species (Rabbit) are rejected."""
        self.client.force_authenticate(user=self.owner)

        payload = {
            'pet': self.my_rabbit.id,
            'reason': 'Moving abroad'
        }

        response = self.client.post(self.listing_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('pet', response.data)

    def test_self_adoption_application_blocked(self):
        """Test that the owner of a listing cannot apply to adopt their own pet."""
        # Create active listing
        listing = RehomingListing.objects.create(
            pet=self.my_dog, owner=self.owner, reason='Moving'
        )

        self.client.force_authenticate(user=self.owner)
        payload = {
            'listing': listing.id,
            'message': 'I want to adopt my own pet!'
        }

        response = self.client.post(self.app_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_adoption_approval_lifecycle_transaction(self):
        """Test adoption application approval flow, ownership transfers, and auto-rejections."""
        # Create listing
        listing = RehomingListing.objects.create(
            pet=self.my_dog, owner=self.owner, reason='Moving'
        )

        # Create two applications
        app1 = RehomingApplication.objects.create(
            listing=listing, applicant=self.applicant, message='First apply'
        )
        app2 = RehomingApplication.objects.create(
            listing=listing, applicant=self.other_applicant, message='Second apply'
        )

        # Owner authenticates to approve app1
        self.client.force_authenticate(user=self.owner)
        detail_url = reverse('rehomingapplication-detail', args=[app1.id])

        payload = {
            'status': 'approved'
        }
        response = self.client.patch(detail_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'approved')

        # 1. Listing should now be marked ADOPTED
        listing.refresh_from_db()
        self.assertEqual(listing.status, RehomingListing.Status.ADOPTED)

        # 2. Other application (app2) must be auto-REJECTED
        app2.refresh_from_db()
        self.assertEqual(app2.status, RehomingApplication.Status.REJECTED)

        # 3. Pet owner must be successfully transferred to the applicant
        self.my_dog.refresh_from_db()
        self.assertEqual(self.my_dog.owner, self.applicant)
