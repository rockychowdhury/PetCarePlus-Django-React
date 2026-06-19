"""
PetCarePlus v2 — AI Assistant Views

API views for interacting with the AI diagnostic assistant.
Manages session rate limiting, conversation saving, Urgency extraction,
and regional provider match generation at session end.
"""

from django.utils import timezone
from django.db.models import F
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError

from common.permissions import IsOwnerOrAdmin
from common.utils import get_local_providers
from apps.animals.models import AnimalType
from apps.providers.models import ServiceProvider
from apps.ai_assistant.models import AISession, AIProviderSuggestion
from apps.ai_assistant.serializers import (
    AISessionSerializer,
    AIChatSerializer,
)
from apps.ai_assistant.gemini import call_gemini


def generate_provider_suggestions(session):
    """
    Ranks and stores the top 3 service providers for the completed session
    using a weighted score: (avg_rating * 0.6) + (is_verified * 0.3) + (normalized_reviews * 0.1)
    """
    if not session.animal_type:
        return

    # 1. Fetch matching providers using cascade location scoping
    if session.user:
        providers_qs = get_local_providers(
            user=session.user,
            provider_type='vet',  # Default to veterinarians for care issues
            animal_type_id=session.animal_type.id
        )
    else:
        # Anonymous users: return all verified vets treating this animal type
        providers_qs = ServiceProvider.objects.filter(
            is_verified=True,
            is_active=True,
            provider_type='vet',
            animal_types__animal_type=session.animal_type
        )

    # 2. Score and rank them
    scored_providers = []
    for provider in providers_qs[:10]:  # Limit pool to top 10 local matches
        # Normalize reviews (cap at 50 for max score scaling)
        normalized_reviews = min(float(provider.total_reviews) / 50.0, 1.0)
        
        # Calculate weighted score
        score = (
            float(provider.avg_rating) * 0.6 +
            (0.3 if provider.is_verified else 0.0) +
            normalized_reviews * 0.1
        )
        
        scored_providers.append((provider, score))

    # Sort descending by score
    scored_providers.sort(key=lambda x: x[1], reverse=True)

    # 3. Create Suggestions in Database
    for rank, (provider, score) in enumerate(scored_providers[:3], start=1):
        reason_en = (
            f"Highly matching veterinarian in your area with a {provider.avg_rating} star rating "
            f"and {provider.total_reviews} verified reviews."
        )
        reason_bn = (
            f"আপনার এলাকায় {provider.avg_rating} স্টার রেটিং এবং {provider.total_reviews} টি "
            f"ভেরিফাইড রিভিউ সহ অত্যন্ত উপযুক্ত পশু চিকিৎসক।"
        )

        AIProviderSuggestion.objects.update_or_create(
            session=session,
            provider=provider,
            defaults={
                'rank': rank,
                'score': score,
                'reason_en': reason_en,
                'reason_bn': reason_bn
            }
        )


class AIChatView(APIView):
    """
    POST endpoint for user-AI interactive diagnostic conversations.
    Enforces a strict 3-turn rate limit for anonymous sessions.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = AIChatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data.get('session_id')
        message = serializer.validated_data.get('message')
        animal_type_id = serializer.validated_data.get('animal_type_id')
        preferred_language = serializer.validated_data.get('preferred_language', 'bn')

        # 1. Fetch or create AISession
        if session_id:
            try:
                session = AISession.objects.get(id=session_id)
            except AISession.DoesNotExist:
                raise NotFound("Specified AI Session not found.")

            # Access controls
            if session.user and session.user != request.user:
                raise PermissionDenied("You do not have permission to access this session.")
        else:
            # For new session, animal_type_id is mandatory
            if not animal_type_id:
                raise ValidationError({"animal_type_id": "Required to initialize a new session."})

            try:
                animal_type = AnimalType.objects.get(id=animal_type_id)
            except AnimalType.DoesNotExist:
                raise ValidationError({"animal_type_id": "Specified animal type does not exist."})

            session = AISession.objects.create(
                user=request.user if request.user.is_authenticated else None,
                animal_type=animal_type,
                conversation_history=[]
            )

        # 2. Rate limiting check for anonymous sessions (max 3 turns)
        if not session.user and session.total_turns >= 3:
            raise PermissionDenied(
                "Guest session limit reached (3 turns). Please log in or register to continue."
            )

        # 3. Append user message to history
        history = list(session.conversation_history)
        history.append({"role": "user", "content": message})

        # 4. Generate reply from Gemini
        animal_name = session.animal_type.name_en if session.animal_type else "Pet"
        gemini_result = call_gemini(
            conversation_history=history,
            preferred_language=preferred_language,
            animal_type_name=animal_name
        )

        reply_content = gemini_result.get('reply', '')
        history.append({"role": "assistant", "content": reply_content})

        # Update turns
        session.conversation_history = history
        session.total_turns = F('total_turns') + 1
        session.save()
        session.refresh_from_db()

        # 5. Handle diagnostic session completion
        if gemini_result.get('session_complete', False):
            session.ended_at = timezone.now()
            session.urgency_level = gemini_result.get('urgency_level', 'monitor_at_home')
            session.ai_diagnosis_summary = gemini_result.get('diagnosis_summary', '')
            session.ai_care_advice = gemini_result.get('care_advice', '')
            session.save()

            # Rank and store suggested local providers
            generate_provider_suggestions(session)
            session.refresh_from_db()

        # Return session details
        response_serializer = AISessionSerializer(session, context={'request': request})
        return Response({
            'reply': reply_content,
            'session': response_serializer.data
        }, status=status.HTTP_200_OK)


class AISessionListView(generics.ListAPIView):
    """
    GET endpoint to retrieve a user's historical sessions.
    """
    serializer_class = AISessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AISession.objects.filter(user=self.request.user).order_by('-created_at')

class AISessionDetailView(generics.RetrieveAPIView):
    """
    GET endpoint to retrieve historical session details.
    """
    queryset = AISession.objects.all()
    serializer_class = AISessionSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        obj = super().get_object()
        # Enforce that private (user-bound) sessions can only be read by their owner or admins
        if obj.user:
            if not self.request.user.is_authenticated:
                raise PermissionDenied("Authentication required to view this session.")
            if obj.user != self.request.user and self.request.user.role != 'admin':
                raise PermissionDenied("You do not have permission to view this session.")
        return obj

class AIPolishView(APIView):
    """
    POST endpoint to refine and polish user text using AI.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        text = request.data.get('text')
        language = request.data.get('language', 'bn')

        if not text:
            raise ValidationError({"text": "Required to polish."})

        from apps.ai_assistant.gemini import polish_text
        polished_text = polish_text(text, language)

        return Response({"polished_text": polished_text}, status=status.HTTP_200_OK)
