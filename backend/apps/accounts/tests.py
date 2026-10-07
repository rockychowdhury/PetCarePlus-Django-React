"""
PetCarePlus v2 — Accounts App Unit Tests

Tests covering user registration, login (JWT + cookie), token refresh,
profile retrieval/updating, and logout.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class AuthAPITests(APITestCase):
    """
    Tests for authentication endpoints (register, login, refresh, logout, profile).
    """

    def setUp(self):
        self.register_url = reverse('auth_register')
        self.login_url = reverse('auth_login')
        self.refresh_url = reverse('token_refresh')
        self.logout_url = reverse('auth_logout')
        self.profile_url = reverse('auth_me')

        # Test registration payload (simplified flow)
        self.register_data = {
            'email': 'testnewuser@petcareplus.com',
            'name': 'Rocky Chowdhury',
            'phone': '01712345678',
            'password': 'testpassword123',
            'role': 'pet_owner',
        }

        # Test user data for setup/login/profile tests
        self.user_data = {
            'email': 'testowner@petcareplus.com',
            'password': 'strongpassword123',
            'full_name': 'Rocky Chowdhury',
            'phone_number': '01712345678',
            'division': 'dhaka',
            'district': 'Dhaka',
            'upazila': 'Gulshan',
            'preferred_language': 'bn',
            'role': 'pet_owner',
        }

    def test_user_registration(self):
        """Test registering a new user successfully."""
        response = self.client.post(self.register_url, self.register_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], self.register_data['email'])
        self.assertEqual(response.data['role'], self.register_data['role'])
        self.assertNotIn('password', response.data)

        # Check in database
        self.assertTrue(User.objects.filter(email=self.register_data['email']).exists())
        user = User.objects.get(email=self.register_data['email'])
        self.assertEqual(user.full_name, 'Rocky Chowdhury')
        self.assertEqual(user.phone_number, '01712345678')

    def test_user_registration_duplicate_email(self):
        """Test registration fails with duplicate email address."""
        # Create a user first
        User.objects.create_user(
            email=self.register_data['email'],
            password='testpassword123',
            full_name='Rocky Chowdhury'
        )
        # Attempt duplicate
        response = self.client.post(self.register_url, self.register_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_login_success_with_http_only_cookie(self):
        """Test successful login returns access token and sets refresh token in httpOnly cookie."""
        # Create user
        user = User.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password'],
            full_name=self.user_data['full_name'],
            role='pet_owner'
        )

        login_payload = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }

        response = self.client.post(self.login_url, login_payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # User payload must be in body
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['email'], user.email)
        
        # Tokens are delivered via httpOnly cookies only, never in the body
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)

        # Both cookies must be set and httpOnly
        self.assertIn('access_token', self.client.cookies)
        self.assertIn('refresh_token', self.client.cookies)
        self.assertTrue(self.client.cookies['access_token']['httponly'])
        self.assertTrue(self.client.cookies['refresh_token']['httponly'])

    def test_token_refresh_via_cookie(self):
        """Test refreshing access token using the refresh token stored in cookies."""
        # Create user & login to populate client cookies
        User.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password'],
            full_name=self.user_data['full_name']
        )

        login_payload = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        self.client.post(self.login_url, login_payload)

        # Confirm cookie is present
        self.assertIn('refresh_token', self.client.cookies)

        # Trigger refresh endpoint (no payload needed because it reads from cookies)
        response = self.client.post(self.refresh_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Rotated access token is delivered via httpOnly cookie, not the body
        self.assertNotIn('access', response.data)
        self.assertNotIn('refresh', response.data)
        self.assertIn('access_token', self.client.cookies)
        self.assertTrue(self.client.cookies['access_token']['httponly'])

    def test_token_refresh_without_session_returns_401(self):
        """No cookie and no body token must yield 401 (not a serializer 400)."""
        response = self.client.post(self.refresh_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_profile_retrieval_and_update(self):
        """Test retrieving and updating user profile (preferred language, division, etc.)."""
        # Create user
        user = User.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password'],
            full_name=self.user_data['full_name'],
            division='barishal',
            district='Bhola',
            upazila='Bhola Sadar',
            preferred_language='en'
        )

        # Authenticate client
        self.client.force_authenticate(user=user)

        # Retrieve profile
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], user.email)
        self.assertEqual(response.data['preferred_language'], 'en')

        # Update profile
        update_payload = {
            'preferred_language': 'bn',
            'division': 'dhaka',
            'district': 'Dhaka',
            'upazila': 'Dhanmondi',
        }
        response = self.client.patch(self.profile_url, update_payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['preferred_language'], 'bn')
        self.assertEqual(response.data['division'], 'dhaka')
        self.assertEqual(response.data['district'], 'Dhaka')
        self.assertEqual(response.data['upazila'], 'Dhanmondi')

        # Verify email and role cannot be changed
        immutable_payload = {
            'email': 'hack@petcareplus.com',
            'role': 'admin'
        }
        response = self.client.patch(self.profile_url, immutable_payload)
        user.refresh_from_db()
        self.assertEqual(user.email, self.user_data['email'])
        self.assertNotEqual(user.role, 'admin')

    def test_logout_clears_cookie(self):
        """Test logging out clears the secure refresh_token cookie."""
        # Create user and login
        User.objects.create_user(
            email=self.user_data['email'],
            password=self.user_data['password'],
            full_name=self.user_data['full_name']
        )
        login_payload = {
            'email': self.user_data['email'],
            'password': self.user_data['password']
        }
        self.client.post(self.login_url, login_payload)
        self.assertIn('refresh_token', self.client.cookies)

        # Logout
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that cookie has been cleared (or set to max_age <= 0 or empty string)
        cookie = self.client.cookies.get('refresh_token')
        self.assertTrue(cookie is None or cookie.value == '')
