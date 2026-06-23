"""
PetCarePlus v2 — AI Assistant Serializers

Serializers for AI diagnostic input/output, conversation sessions, and provider matches.
"""

from rest_framework import serializers
import ast
from apps.ai_assistant.models import AISession, AIProviderSuggestion
from apps.animals.serializers import AnimalTypeSerializer
from apps.providers.serializers import ServiceProviderSerializer
from apps.resources.serializers import ResourceSerializer


class AIProviderSuggestionSerializer(serializers.ModelSerializer):
    """
    Serializer for ranked provider suggestions generated after an AI diagnostic session.
    """
    provider_details = ServiceProviderSerializer(source='provider', read_only=True)
    reason = serializers.SerializerMethodField()

    class Meta:
        model = AIProviderSuggestion
        fields = [
            'id', 'provider', 'provider_details', 'rank', 'score',
            'reason_en', 'reason_bn', 'reason'
        ]

    def get_reason(self, obj):
        request = self.context.get('request')
        lang = 'bn'
        if request:
            if request.user and request.user.is_authenticated:
                lang = getattr(request.user, 'preferred_language', 'bn')
            else:
                accept_lang = request.headers.get('Accept-Language', 'bn')
                lang = accept_lang[:2].lower()
                lang = lang if lang in ('bn', 'en') else 'bn'

        value = getattr(obj, f'reason_{lang}', None)
        if value:
            return value
        return getattr(obj, 'reason_en', '')


class AISessionSerializer(serializers.ModelSerializer):
    """
    Serializer for retrieving an AISession with its full conversation history
    and generated provider suggestions.
    """
    animal_type_details = AnimalTypeSerializer(source='animal_type', read_only=True)
    provider_suggestions = AIProviderSuggestionSerializer(many=True, read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    diagnostic_result = serializers.SerializerMethodField()

    class Meta:
        model = AISession
        fields = [
            'id', 'user', 'user_email', 'animal_type', 'animal_type_details',
            'conversation_history', 'total_turns', 'urgency_level',
            'ai_diagnosis_summary', 'ai_care_advice', 'started_at', 'ended_at',
            'provider_suggestions', 'is_complete', 'diagnostic_result'
        ]
        read_only_fields = [
            'id', 'user', 'conversation_history', 'total_turns', 'urgency_level',
            'ai_diagnosis_summary', 'ai_care_advice', 'started_at', 'ended_at',
            'provider_suggestions'
        ]

    def get_diagnostic_result(self, obj):
        try:
            history = obj.conversation_history
            if history and len(history) >= 2:
                content = history[1].get('content', '')
                if content.startswith('{'):
                    # The content is a string representation of a Python dict from Gemini
                    ai_response = ast.literal_eval(content)
                    return {
                        'ai_response': ai_response,
                        'query_type': ai_response.get('query_type', 'disease'),
                        'providers': AIProviderSuggestionSerializer(
                            obj.provider_suggestions.all().order_by('rank'),
                            many=True,
                            context=self.context
                        ).data,
                        'animal_type': AnimalTypeSerializer(obj.animal_type).data,
                        'resources': [],
                        'govt_vets': []
                    }
        except Exception:
            pass
        return None


class AIDiagnoseInputSerializer(serializers.Serializer):
    """
    Input serializer for the one-shot AI diagnostic endpoint.
    """
    animal_type_id = serializers.IntegerField(
        required=True,
        help_text="Animal type ID (e.g., cow, cat, dog)"
    )
    problem_description = serializers.CharField(
        required=True,
        min_length=10,
        max_length=3000,
        help_text="Detailed description of the problem, symptoms, or question"
    )
    preferred_language = serializers.CharField(
        required=False,
        default='bn',
        max_length=2,
        help_text="Language code ('bn' or 'en')"
    )
    user_division = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=50,
        help_text="User's division for location-based provider matching"
    )
    user_district = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=50,
        help_text="User's district for location-based provider matching"
    )
    user_latitude = serializers.FloatField(
        required=False,
        allow_null=True,
        help_text="User's latitude from geolocation"
    )
    user_longitude = serializers.FloatField(
        required=False,
        allow_null=True,
        help_text="User's longitude from geolocation"
    )


class AIChatSerializer(serializers.Serializer):
    """
    Serializer for parsing incoming chat messages to the AI assistant.
    Kept for backward compatibility with polish/scoring features.
    """
    session_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Existing session ID to continue history"
    )
    message = serializers.CharField(
        required=True,
        help_text="Message text from the user"
    )
    animal_type_id = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Animal type ID (required for new sessions)"
    )
    preferred_language = serializers.CharField(
        required=False,
        default='bn',
        max_length=2,
        help_text="Language code ('bn' or 'en')"
    )
