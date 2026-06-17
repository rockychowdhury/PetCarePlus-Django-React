"""
PetCarePlus v2 — Reviews App Unit Tests

Tests covering review creation rules (ownership, completed booking requirement),
duplicate review checks, and auto-updating ServiceProvider avg_rating and total_reviews.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from datetime import date

from apps.providers.models import ServiceProvider
from apps.bookings.models import Booking
from apps.reviews.models import Review

User = get_user_model()


class ReviewsAPITests(APITestCase):
    """
    Tests for Review API endpoints and signal triggers.
    """

    def setUp(self):
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

        # Create bookings with different statuses
        self.completed_booking = Booking.objects.create(
            user=self.customer,
            provider=self.provider,
            booking_date=date.today(),
            status=Booking.Status.COMPLETED
        )
        self.pending_booking = Booking.objects.create(
            user=self.customer,
            provider=self.provider,
            booking_date=date.today(),
            status=Booking.Status.PENDING
        )
        self.other_completed_booking = Booking.objects.create(
            user=self.other_customer,
            provider=self.provider,
            booking_date=date.today(),
            status=Booking.Status.COMPLETED
        )

        # URLs
        self.review_list_url = reverse('review-list')

    def test_create_review_success_triggers_recalculation(self):
        """Test review creation updates provider rating and total review counts via signals."""
        self.client.force_authenticate(user=self.customer)

        # Verify initial ratings
        self.assertEqual(self.provider.avg_rating, 0)
        self.assertEqual(self.provider.total_reviews, 0)

        payload = {
            'booking': self.completed_booking.id,
            'rating': 5,
            'comment': 'Amazing service, very responsive!'
        }

        response = self.client.post(self.review_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['rating'], 5)

        # Refresh provider from db
        self.provider.refresh_from_db()
        self.assertEqual(self.provider.avg_rating, 5.0)
        self.assertEqual(self.provider.total_reviews, 1)

        # Submit another review from other customer to verify averaging
        self.client.force_authenticate(user=self.other_customer)
        other_payload = {
            'booking': self.other_completed_booking.id,
            'rating': 3,
            'comment': 'Good enough'
        }
        self.client.post(self.review_list_url, other_payload)

        self.provider.refresh_from_db()
        self.assertEqual(self.provider.avg_rating, 4.0)  # (5 + 3) / 2 = 4
        self.assertEqual(self.provider.total_reviews, 2)

    def test_create_review_fails_for_non_completed_booking(self):
        """Test that submitting a review for a pending/non-completed booking fails."""
        self.client.force_authenticate(user=self.customer)

        payload = {
            'booking': self.pending_booking.id,
            'rating': 4,
            'comment': 'Not done yet'
        }

        response = self.client.post(self.review_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('booking', response.data)

    def test_create_review_fails_for_non_owner(self):
        """Test that a user cannot review another customer's completed booking."""
        self.client.force_authenticate(user=self.customer)

        payload = {
            'booking': self.other_completed_booking.id,  # Owned by other_customer
            'rating': 5,
            'comment': 'Hacking review'
        }

        response = self.client.post(self.review_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('booking', response.data)

    def test_create_duplicate_review_fails(self):
        """Test that submitting a second review for the same booking is blocked."""
        # Create first review
        Review.objects.create(
            booking=self.completed_booking,
            reviewer=self.customer,
            provider=self.provider,
            rating=4,
            comment='First review'
        )

        self.client.force_authenticate(user=self.customer)
        payload = {
            'booking': self.completed_booking.id,
            'rating': 5,
            'comment': 'Duplicate review'
        }

        response = self.client.post(self.review_list_url, payload)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('booking', response.data)
