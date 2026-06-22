"""
PetCarePlus v2 — AI Assistant App Unit Tests

Tests covering interactive chat flows, anonymous turn-limit rate limits,
session completion logic, and weighted provider suggestions.
"""

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from apps.animals.models import AnimalType
from apps.providers.models import ServiceProvider
from apps.ai_assistant.models import AISession, AIProviderSuggestion

User = get_user_model()


class AIAssistantAPITests(APITestCase):
    """
    Tests for AI assistant chat session endpoints and matching algorithms.
    """

    def setUp(self):
        # Create animal types
        self.cat_type = AnimalType.objects.create(
            name_en='Cat', name_bn='বিড়াল', slug='cat',
            category='companion', icon='cat', supports_services=True
        )

        # Create users
        self.user = User.objects.create_user(
            email='owner@test.com', password='password123',
            first_name='Rocky', last_name='Owner', role='pet_owner'
        )
        self.provider_user = User.objects.create_user(
            email='provider@test.com', password='password123',
            first_name='Dr. Rocky', last_name='Provider', role='provider'
        )

        # Create service providers in the area (verified + unverified to test weighting)
        self.verified_vet = ServiceProvider.objects.create(
            user=self.provider_user,
            business_name='Top Vet Services',
            provider_type='vet',
            division='dhaka', district='Dhaka', phone='01712345678',
            is_verified=True, avg_rating=4.8, total_reviews=25
        )
        # Link to cat type
        from apps.providers.models import ProviderAnimalType
        ProviderAnimalType.objects.create(provider=self.verified_vet, animal_type=self.cat_type)

        self.chat_url = reverse('ai_chat')

    def test_new_session_creation_authenticated_user(self):
        """Test successful initialization and chat flow for an authenticated user."""
        self.client.force_authenticate(user=self.user)

        payload = {
            'animal_type_id': self.cat_type.id,
            'message': 'My cat has stopped eating.',
            'preferred_language': 'en'
        }

        response = self.client.post(self.chat_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('reply', response.data)
        self.assertIn('session', response.data)
        
        # Verify turn turns count and user binding
        session_data = response.data['session']
        self.assertEqual(session_data['total_turns'], 1)
        self.assertEqual(session_data['user_email'], self.user.email)
        self.assertEqual(len(session_data['conversation_history']), 2)  # [User, AI]

    def test_anonymous_session_turn_rate_limiting(self):
        """Test anonymous user limit (max 3 turns without login)."""
        # Turn 1
        payload = {
            'animal_type_id': self.cat_type.id,
            'message': 'Symptom query 1'
        }
        response = self.client.post(self.chat_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        session_id = response.data['session']['id']

        # Turn 2
        payload = {
            'session_id': session_id,
            'message': 'Symptom query 2'
        }
        response = self.client.post(self.chat_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Turn 3
        payload = {
            'session_id': session_id,
            'message': 'Symptom query 3'
        }
        response = self.client.post(self.chat_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['session']['total_turns'], 3)

        # Turn 4 (Should fail with 403 Forbidden)
        payload = {
            'session_id': session_id,
            'message': 'Symptom query 4'
        }
        response = self.client.post(self.chat_url, payload)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_session_completion_triggers_suggestions(self):
        """Test session completion extracts diagnostics and calculates weighted provider matches."""
        self.client.force_authenticate(user=self.user)

        # Start a new session
        payload = {
            'animal_type_id': self.cat_type.id,
            'message': 'My cat has an urgent bleeding symptom.'
        }
        response = self.client.post(self.chat_url, payload)
        session_id = response.data['session']['id']

        # Send message containing "done" trigger to complete mock session
        payload = {
            'session_id': session_id,
            'message': 'Everything is done, yes.'
        }
        response = self.client.post(self.chat_url, payload)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        session_data = response.data['session']
        self.assertTrue(session_data['is_complete'])
        self.assertEqual(session_data['urgency_level'], 'emergency')  # Urgency extracted
        self.assertTrue(session_data['ai_diagnosis_summary'] != "")
        
        # Verify provider recommendations were computed and generated
        suggestions = session_data['provider_suggestions']
        self.assertEqual(len(suggestions), 1)  # Only verified_vet treat cats in setup
        self.assertEqual(suggestions[0]['provider'], self.verified_vet.id)
        self.assertEqual(suggestions[0]['rank'], 1)
        self.assertTrue(float(suggestions[0]['score']) > 0)
        self.assertIn('পশু চিকিৎসক', suggestions[0]['reason_bn'])  # Auto-resolved language details


