"""
PetCarePlus v2 — AI Assistant Serializers

Serializers for AI conversation sessions, user inputs, and provider matches.
"""

from rest_framework import serializers
from apps.ai_assistant.models import AISession, AIProviderSuggestion
from apps.animals.serializers import AnimalTypeSerializer
from apps.providers.serializers import ServiceProviderSerializer


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
        # Determine language context from request or user profile
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

    class Meta:
        model = AISession
        fields = [
            'id', 'user', 'user_email', 'animal_type', 'animal_type_details',
            'conversation_history', 'total_turns', 'urgency_level',
            'ai_diagnosis_summary', 'ai_care_advice', 'started_at', 'ended_at',
            'provider_suggestions', 'is_complete'
        ]
        read_only_fields = [
            'id', 'user', 'conversation_history', 'total_turns', 'urgency_level',
            'ai_diagnosis_summary', 'ai_care_advice', 'started_at', 'ended_at',
            'provider_suggestions'
        ]


class AIChatSerializer(serializers.Serializer):
    """
    Serializer for parsing incoming chat messages to the AI assistant.
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
