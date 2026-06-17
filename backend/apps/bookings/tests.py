"""
PetCarePlus v2 — Bookings App Unit Tests

Tests covering booking creation, service-to-provider alignment validations,
pet ownership checks, scoped listings by role, and state transition restrictions.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import date

from apps.animals.models import AnimalType
from apps.providers.models import ServiceProvider, ProviderService
from apps.bookings.models import Booking
from apps.pets.models import Pet

User = get_user_model()


class BookingsAPITests(APITestCase):
    """
    Tests for Booking API endpoints.
    """

    def setUp(self):
        # Create animal types
        self.cat_type = AnimalType.objects.create(
            name_en='Cat', name_bn='বিড়াল', slug='cat',
            category='companion', icon='cat', supports_services=True
        )

        # Create users
        self.customer = User.objects.create_user(
            email='customer@test.com', password='password123',
            first_name='Rocky', last_name='Customer', role='pet_owner'
        )
        self.other_customer = User.objects.create_user(
            email='other@test.com', password='password123',
            first_name='Other', last_name='Customer', role='pet_owner'
        )
        self.provider_user = User.objects.create_user(
            email='provider@test.com', password='password123',
            first_name='Dr. Rocky', last_name='Provider', role='provider'
        )

        # Create provider profile
        self.provider = ServiceProvider.objects.create(
            user=self.provider_user,
            business_name='Rocky Vet Services',
            provider_type='vet',
            division='dhaka',
            district='Dhaka',
            phone='01712345678',
            is_verified=True
        )

        # Create provider services
        self.service = ProviderService.objects.create(
            provider=self.provider,
            name_en='Vaccination Checkup',
            price='1000.00'
        )

        # Create other provider
        self.other_provider_user = User.objects.create_user(
            email='other_prov@test.com', password='password123',
            first_name='Dr. Other', last_name='Provider', role='provider'
        )
        self.other_provider = ServiceProvider.objects.create(
            user=self.other_provider_user,
            business_name='Other Clinic',
            provider_type='vet',
            division='dhaka',
            district='Dhaka',
            phone='01712345679',
            is_verified=True
        )
        self.other_service = ProviderService.objects.create(
            provider=self.other_provider,
            name_en='Different Service',
            price='500.00'
        )

        # Create pets
        self.my_pet = Pet.objects.create(
            owner=self.customer,
            animal_type=self.cat_type,
            name='Milo'
        )
        self.other_pet = Pet.objects.create(
            owner=self.other_customer,
            animal_type=self.cat_type,
            name='Simba'
        )

        # URLs
        self.booking_list_url = reverse('booking-list')

    def test_create_booking_success(self):
        """Test successful booking creation."""
        self.client.force_authenticate(user=self.customer)

        payload = {
            'provider': self.provider.id,
            'service': self.service.id,
            'pet': self.my_pet.id,
            'booking_date': str(date.today()),
            'notes': 'Pls be gentle'
        }

        response = self.client.post(self.booking_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['status'], 'pending')
        self.assertEqual(response.data['user_email'], self.customer.email)

    def test_create_booking_validation_service_mismatch(self):
        """Test booking fails when selected service belongs to a different provider."""
        self.client.force_authenticate(user=self.customer)

        payload = {
            'provider': self.provider.id,
            'service': self.other_service.id,  # belongs to other_provider
            'booking_date': str(date.today())
        }

        response = self.client.post(self.booking_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('service', response.data)

    def test_create_booking_validation_pet_ownership(self):
        """Test booking fails when selected pet belongs to a different user."""
        self.client.force_authenticate(user=self.customer)

        payload = {
            'provider': self.provider.id,
            'service': self.service.id,
            'pet': self.other_pet.id,  # belongs to other_customer
            'booking_date': str(date.today())
        }

        response = self.client.post(self.booking_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('pet', response.data)

    def test_list_bookings_role_scoping(self):
        """Test that list queries return scoped results depending on the user's role."""
        # Create a booking
        booking = Booking.objects.create(
            user=self.customer,
            provider=self.provider,
            service=self.service,
            booking_date=date.today(),
            status=Booking.Status.PENDING
        )

        # 1. Customer should see only their bookings
        self.client.force_authenticate(user=self.customer)
        response = self.client.get(self.booking_list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        # Other customer should see 0
        self.client.force_authenticate(user=self.other_customer)
        response = self.client.get(self.booking_list_url)
        self.assertEqual(len(response.data['results']), 0)

        # 2. Provider should see bookings booked with them
        self.client.force_authenticate(user=self.provider_user)
        response = self.client.get(self.booking_list_url)
        self.assertEqual(len(response.data['results']), 1)

    def test_booking_status_transitions(self):
        """Test role-based booking status transition constraints."""
        booking = Booking.objects.create(
            user=self.customer,
            provider=self.provider,
            service=self.service,
            booking_date=date.today(),
            status=Booking.Status.PENDING
        )

        detail_url = reverse('booking-detail', args=[booking.id])

        # 1. Customer CAN cancel
        self.client.force_authenticate(user=self.customer)
        response = self.client.patch(detail_url, {'status': 'cancelled'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Reset to pending
        booking.status = Booking.Status.PENDING
        booking.save()

        # Customer CANNOT confirm
        response = self.client.patch(detail_url, {'status': 'confirmed'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Provider CAN confirm
        self.client.force_authenticate(user=self.provider_user)
        response = self.client.patch(detail_url, {'status': 'confirmed'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Provider CAN complete
        response = self.client.patch(detail_url, {'status': 'completed'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
