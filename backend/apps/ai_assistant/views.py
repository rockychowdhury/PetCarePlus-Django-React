"""
PetCarePlus v2 — AI Assistant Views

API views for the one-shot AI diagnostic endpoint, session management,
text polishing, and provider suggestion generation.
"""

from django.utils import timezone
from django.db.models import Q
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied, NotFound, ValidationError

from common.utils import get_local_providers
from apps.animals.models import AnimalType
from apps.providers.models import ServiceProvider
from apps.resources.models import Resource
from apps.resources.serializers import ResourceSerializer
from apps.ai_assistant.models import AISession, AIProviderSuggestion
from apps.ai_assistant.serializers import (
    AISessionSerializer,
    AIDiagnoseInputSerializer,
    AIProviderSuggestionSerializer,
)
from apps.ai_assistant.gemini_diagnose import diagnose_with_gemini
from apps.providers.serializers import ServiceProviderSerializer


class MockUser:
    """Lightweight object carrying location attributes for provider matching."""
    def __init__(self, division=None, district=None, upazila=None, union=None,
                 latitude=None, longitude=None):
        self.division = division
        self.district = district
        self.upazila = upazila
        self.union = union
        self.latitude = latitude
        self.longitude = longitude


def _score_and_rank_providers(providers_qs, max_count=5):
    """
    Score and rank a provider queryset.
    Returns list of dicts with provider data, rank, score, and bilingual reason.
    """
    scored = []
    for provider in providers_qs[:15]:
        normalized_reviews = min(float(provider.total_reviews) / 50.0, 1.0)
        score = (
            float(provider.avg_rating) * 0.6 +
            (0.3 if provider.is_verified else 0.0) +
            normalized_reviews * 0.1
        )
        scored.append((provider, score))

    scored.sort(key=lambda x: x[1], reverse=True)

    results = []
    for rank, (provider, score) in enumerate(scored[:max_count], start=1):
        reason_en = (
            f"Highly matching veterinarian in your area with a {provider.avg_rating} star rating "
            f"and {provider.total_reviews} verified reviews."
        )
        reason_bn = (
            f"আপনার এলাকায় {provider.avg_rating} স্টার রেটিং এবং {provider.total_reviews} টি "
            f"ভেরিফাইড রিভিউ সহ অত্যন্ত উপযুক্ত পশু চিকিৎসক।"
        )
        results.append({
            'provider': provider,
            'rank': rank,
            'score': round(score, 3),
            'reason_en': reason_en,
            'reason_bn': reason_bn,
        })

    return results


def _match_resources(animal_type, keywords, limit=6):
    """
    Match resources from the database by animal type and keyword search.
    """
    qs = Resource.objects.filter(is_active=True)

    if animal_type:
        qs = qs.filter(
            Q(animal_types=animal_type) | Q(animal_types__isnull=True)
        ).distinct()

    if keywords:
        keyword_q = Q()
        for kw in keywords[:5]:
            keyword_q |= (
                Q(title_en__icontains=kw) |
                Q(title_bn__icontains=kw) |
                Q(description_en__icontains=kw) |
                Q(description_bn__icontains=kw)
            )
        keyword_matched = qs.filter(keyword_q).distinct()
        if keyword_matched.exists():
            return keyword_matched[:limit]

    return qs[:limit]


def _get_govt_vets(animal_type, division=None, district=None, latitude=None, longitude=None):
    """
    Get government veterinary officers near the user's location.
    """
    qs = ServiceProvider.objects.filter(
        is_government_vet=True,
        is_active=True,
    )

    if animal_type:
        qs = qs.filter(
            Q(animal_types__animal_type=animal_type) |
            Q(animal_types__isnull=True)
        ).distinct()

    if district:
        local = qs.filter(district__iexact=district)
        if local.exists():
            return local[:3]

    if division:
        regional = qs.filter(division__iexact=division)
        if regional.exists():
            return regional[:3]

    return qs[:3]


class AIDiagnoseView(APIView):
    """
    POST /api/v1/ai/diagnose/

    One-shot AI diagnostic endpoint. Accepts animal type, problem description,
    and optional location. Returns structured diagnosis with matched providers
    and resources.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = AIDiagnoseInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        animal_type_id = serializer.validated_data['animal_type_id']
        problem_description = serializer.validated_data['problem_description']
        preferred_language = serializer.validated_data.get('preferred_language', 'bn')
        user_division = serializer.validated_data.get('user_division', '')
        user_district = serializer.validated_data.get('user_district', '')
        user_latitude = serializer.validated_data.get('user_latitude')
        user_longitude = serializer.validated_data.get('user_longitude')

        # 1. Validate animal type
        try:
            animal_type = AnimalType.objects.get(id=animal_type_id)
        except AnimalType.DoesNotExist:
            raise ValidationError({"animal_type_id": "Specified animal type does not exist."})

        # 2. Resolve location from user profile or request
        if request.user.is_authenticated and not user_division:
            user_division = request.user.division or ''
            user_district = request.user.district or ''
            if not user_latitude:
                user_latitude = getattr(request.user, 'latitude', None)
                user_longitude = getattr(request.user, 'longitude', None)

        # 3. Call Gemini
        ai_result = diagnose_with_gemini(
            animal_type_name=animal_type.name_en,
            animal_category=animal_type.category,
            problem_description=problem_description,
            preferred_language=preferred_language,
        )

        # 4. Save to AISession
        session = AISession.objects.create(
            user=request.user if request.user.is_authenticated else None,
            animal_type=animal_type,
            conversation_history=[
                {"role": "user", "content": problem_description},
                {"role": "assistant", "content": str(ai_result)},
            ],
            total_turns=1,
            ended_at=timezone.now(),
        )

        # Extract urgency and summaries for the session record
        query_type = ai_result.get('query_type', 'disease')
        if query_type == 'disease' and ai_result.get('urgency'):
            session.urgency_level = ai_result['urgency'].get('level', 'monitor_at_home')
            diagnosis_data = ai_result.get('diagnosis', {})
            if diagnosis_data:
                session.ai_diagnosis_summary = diagnosis_data.get('possible_problems', '')
                session.ai_care_advice = diagnosis_data.get('what_owner_can_do', '')
            session.save()

        # 5. Match providers
        recommended_type = ai_result.get('recommended_provider_type', 'vet')
        providers_data = []

        location_user = MockUser(
            division=user_division,
            district=user_district,
            latitude=user_latitude,
            longitude=user_longitude,
        )

        if request.user.is_authenticated:
            providers_qs = get_local_providers(
                user=request.user,
                provider_type=recommended_type,
                animal_type_id=animal_type.id
            )
        elif user_division or user_district or user_latitude:
            providers_qs = get_local_providers(
                user=location_user,
                provider_type=recommended_type,
                animal_type_id=animal_type.id
            )
        else:
            providers_qs = ServiceProvider.objects.filter(
                is_verified=True,
                is_active=True,
                provider_type=recommended_type,
                animal_types__animal_type=animal_type
            ).order_by('-avg_rating')

        ranked_providers = _score_and_rank_providers(providers_qs, max_count=5)

        # Save suggestions to DB and serialize
        for item in ranked_providers:
            AIProviderSuggestion.objects.update_or_create(
                session=session,
                provider=item['provider'],
                defaults={
                    'rank': item['rank'],
                    'score': item['score'],
                    'reason_en': item['reason_en'],
                    'reason_bn': item['reason_bn'],
                }
            )

        providers_serialized = []
        for item in ranked_providers:
            provider_data = ServiceProviderSerializer(
                item['provider'], context={'request': request}
            ).data
            providers_serialized.append({
                'rank': item['rank'],
                'score': item['score'],
                'reason_en': item['reason_en'],
                'reason_bn': item['reason_bn'],
                'provider_details': provider_data,
            })

        # 6. Match resources
        resource_keywords = ai_result.get('resource_keywords', [])
        matched_resources = _match_resources(animal_type, resource_keywords)
        resources_serialized = ResourceSerializer(
            matched_resources, many=True, context={'request': request}
        ).data

        # 7. Get govt vets if needed
        govt_vets_serialized = []
        suggest_livestock_officer = ai_result.get('suggest_livestock_officer', False)
        if suggest_livestock_officer:
            govt_vets = _get_govt_vets(
                animal_type,
                division=user_division,
                district=user_district,
                latitude=user_latitude,
                longitude=user_longitude,
            )
            govt_vets_serialized = ServiceProviderSerializer(
                govt_vets, many=True, context={'request': request}
            ).data

        # 8. Build response
        response_data = {
            'session_id': session.id,
            'query_type': query_type,
            'ai_response': ai_result,
            'providers': providers_serialized,
            'resources': resources_serialized,
            'govt_vets': govt_vets_serialized,
            'animal_type': {
                'id': animal_type.id,
                'name_en': animal_type.name_en,
                'name_bn': animal_type.name_bn,
                'slug': animal_type.slug,
                'category': animal_type.category,
            }
        }

        return Response(response_data, status=status.HTTP_200_OK)


class AISessionListView(generics.ListAPIView):
    """
    GET endpoint to retrieve a user's historical sessions.
    """
    serializer_class = AISessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return AISession.objects.filter(user=self.request.user).order_by('-started_at')


class AISessionDetailView(generics.RetrieveAPIView):
    """
    GET endpoint to retrieve historical session details.
    """
    queryset = AISession.objects.all()
    serializer_class = AISessionSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        obj = super().get_object()
        if obj.user:
            if not self.request.user.is_authenticated:
                raise PermissionDenied("Authentication required to view this session.")
            if obj.user != self.request.user and self.request.user.role != 'admin':
                raise PermissionDenied("You do not have permission to view this session.")
        return obj


class AIPolishView(APIView):
    """
    POST endpoint to refine and polish user text using AI.
    Used for rehoming application text polishing.
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
