"""
PetCarePlus v2 — Notifications App Unit Tests

Tests covering auto-notification signal creations on bookings, rehoming applications,
and reviews, and API operations (mark read, mark all read).
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import date

from apps.animals.models import AnimalType
from apps.pets.models import Pet
from apps.providers.models import ServiceProvider
from apps.bookings.models import Booking
from apps.rehoming.models import RehomingListing, RehomingApplication
from apps.reviews.models import Review
from apps.notifications.models import Notification

User = get_user_model()


class NotificationsAPITests(APITestCase):
    """
    Tests for automated signal notifications and the Notification API endpoints.
    """

    def setUp(self):
        # Create animal types
        self.cat_type = AnimalType.objects.create(
            name_en='Cat', name_bn='বিড়াল', slug='cat',
            category='companion', icon='cat', supports_services=True, supports_rehoming=True
        )

        # Create users
        self.customer = User.objects.create_user(
            email='customer@test.com', password='password123',
            first_name='Rocky', last_name='Customer', role='pet_owner'
        )
        self.provider_user = User.objects.create_user(
            email='provider@test.com', password='password123',
            first_name='Dr. Rocky', last_name='Provider', role='provider'
        )

        # Create provider profile
        self.provider = ServiceProvider.objects.create(
            user=self.provider_user,
            business_name='Rocky Vet Clinic',
            provider_type='vet',
            division='dhaka', district='Dhaka', phone='01712345678',
            is_verified=True
        )

        # Create pets
        self.pet = Pet.objects.create(
            owner=self.customer, animal_type=self.cat_type, name='Milo'
        )

        # URLs
        self.list_url = reverse('notification-list')

    def test_booking_events_trigger_notifications(self):
        """Test that booking creations and updates trigger auto-notifications correctly."""
        # 1. Create a booking (should notify the provider)
        booking = Booking.objects.create(
            user=self.customer,
            provider=self.provider,
            booking_date=date.today(),
            status=Booking.Status.PENDING
        )

        # Check notification for provider
        self.assertTrue(Notification.objects.filter(
            user=self.provider_user,
            notification_type=Notification.NotificationType.BOOKING
        ).exists())

        # 2. Update booking status to confirmed (should notify customer)
        booking.status = Booking.Status.CONFIRMED
        booking.save()

        # Check notification for customer
        self.assertTrue(Notification.objects.filter(
            user=self.customer,
            notification_type=Notification.NotificationType.BOOKING,
            title_en__contains='Confirmed'
        ).exists())

    def test_rehoming_adoption_triggers_notifications(self):
        """Test rehoming application events generate notifications."""
        # Create listing
        listing = RehomingListing.objects.create(
            pet=self.pet, owner=self.customer, reason='Relocating'
        )

        # Create application from provider user (representing applicant)
        app = RehomingApplication.objects.create(
            listing=listing, applicant=self.provider_user, message='Adopting Milo'
        )

        # 1. Check listing owner received notification
        self.assertTrue(Notification.objects.filter(
            user=self.customer,
            notification_type=Notification.NotificationType.APPLICATION,
            title_en='New Adoption Application'
        ).exists())

        # 2. Approve application (should notify applicant)
        app.status = RehomingApplication.Status.APPROVED
        app.save()

        self.assertTrue(Notification.objects.filter(
            user=self.provider_user,
            notification_type=Notification.NotificationType.APPLICATION,
            title_en__contains='Approved'
        ).exists())

    def test_reviews_trigger_notifications(self):
        """Test submitting review auto-notifies provider."""
        # Create completed booking
        booking = Booking.objects.create(
            user=self.customer,
            provider=self.provider,
            booking_date=date.today(),
            status=Booking.Status.COMPLETED
        )

        # Submit review
        Review.objects.create(
            booking=booking, reviewer=self.customer, provider=self.provider,
            rating=5, comment='Super clinic!'
        )

        # Check notification for provider
        self.assertTrue(Notification.objects.filter(
            user=self.provider_user,
            notification_type=Notification.NotificationType.REVIEW
        ).exists())

    def test_mark_read_and_mark_all_read_endpoints(self):
        """Test API endpoints to mark notifications as read and mark all read."""
        # Create three unread notifications for customer
        Notification.objects.create(
            user=self.customer, title_en='N1', is_read=False
        )
        Notification.objects.create(
            user=self.customer, title_en='N2', is_read=False
        )
        n3 = Notification.objects.create(
            user=self.customer, title_en='N3', is_read=False
        )

        self.client.force_authenticate(user=self.customer)

        # 1. Mark N3 read
        mark_read_url = reverse('notification-mark-read', args=[n3.id])
        response = self.client.post(mark_read_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        n3.refresh_from_db()
        self.assertTrue(n3.is_read)

        # 2. Mark all read
        mark_all_url = reverse('notification-mark-all-read')
        response = self.client.post(mark_all_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify all customer's notifications are read
        unread_count = Notification.objects.filter(user=self.customer, is_read=False).count()
        self.assertEqual(unread_count, 0)
