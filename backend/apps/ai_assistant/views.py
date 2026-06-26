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
    AIChatSerializer,
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


class AIChatView(APIView):
    """
    POST /api/v1/ai/chat/

    Multi-turn diagnostic chat session. Enforces IsAuthenticated.
    Retrieves database guidelines (RAG) based on user symptom keywords.
    Completes session dynamically, matching local service providers.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = AIChatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session_id = serializer.validated_data.get('session_id')
        message = serializer.validated_data['message']
        animal_type_id = serializer.validated_data.get('animal_type_id')
        preferred_language = serializer.validated_data.get('preferred_language', 'bn')
        
        user_division = serializer.validated_data.get('user_division', '')
        user_district = serializer.validated_data.get('user_district', '')
        user_latitude = serializer.validated_data.get('user_latitude')
        user_longitude = serializer.validated_data.get('user_longitude')

        # 1. Retrieve or create session
        if session_id:
            try:
                session = AISession.objects.get(id=session_id)
            except AISession.DoesNotExist:
                raise NotFound("Specified session does not exist.")
            
            # Check ownership
            if session.user != request.user:
                raise PermissionDenied("You do not have access to this session.")
            if session.is_complete:
                raise ValidationError({"non_field_errors": ["Cannot send messages to a completed session."]})
            
            animal_type = session.animal_type
        else:
            if not animal_type_id:
                raise ValidationError({"animal_type_id": "Required for a new session."})
            
            try:
                animal_type = AnimalType.objects.get(id=animal_type_id)
            except AnimalType.DoesNotExist:
                raise ValidationError({"animal_type_id": "Specified animal type does not exist."})
            
            session = AISession.objects.create(
                user=request.user,
                animal_type=animal_type,
                conversation_history=[],
                total_turns=0,
            )

        # 2. Extract keywords from user message for RAG context
        import re
        words = re.findall(r'\w+', message.lower())
        keywords = [w for w in words if len(w) > 3][:5]
        
        # Match guidelines (RAG)
        matched_resources = _match_resources(animal_type, keywords, limit=3)
        guideline_context = ""
        for idx, g in enumerate(matched_resources, 1):
            title = g.title_bn if preferred_language == 'bn' else g.title_en
            desc = g.description_bn if preferred_language == 'bn' else g.description_en
            guideline_context += f"Guideline #{idx}: {title}\n{desc}\n\n"

        # 3. Update history with user's message
        session.conversation_history.append({"role": "user", "content": message})
        session.total_turns += 1

        # 4. Call Gemini conversational API
        from apps.ai_assistant.gemini import call_gemini
        result_dict = call_gemini(
            conversation_history=session.conversation_history,
            preferred_language=preferred_language,
            animal_type_name=animal_type.name_en,
            guideline_context=guideline_context if guideline_context else None,
            total_turns=session.total_turns
        )

        reply = result_dict.get('reply', '')
        session_complete = result_dict.get('session_complete', False)

        # Append assistant message
        # If complete, serialize the raw dict as content so history has diagnosis info
        content_to_save = str(result_dict) if session_complete else reply
        session.conversation_history.append({"role": "assistant", "content": content_to_save})
        session.save()

        # 5. Handle Session Completion (calculate recommendations)
        providers_serialized = []
        resources_serialized = []
        govt_vets_serialized = []
        query_type = 'disease'

        if session_complete:
            session.ended_at = timezone.now()
            
            # Save extracted results
            urgency_level = result_dict.get('urgency_level', 'monitor_at_home')
            session.urgency_level = urgency_level
            
            diagnosis_summary = result_dict.get('diagnosis_summary', '')
            care_advice = result_dict.get('care_advice', '')
            session.ai_diagnosis_summary = diagnosis_summary
            session.ai_care_advice = care_advice
            session.save()

            # Match providers based on Gemini's recommendation
            recommended_type = result_dict.get('recommended_provider_type', 'vet')
            
            # Resolve locations
            loc_div = user_division or request.user.division or ''
            loc_dist = user_district or request.user.district or ''
            loc_lat = user_latitude or getattr(request.user, 'latitude', None)
            loc_lng = user_longitude or getattr(request.user, 'longitude', None)

            location_user = MockUser(
                division=loc_div,
                district=loc_dist,
                latitude=loc_lat,
                longitude=loc_lng,
            )

            providers_qs = get_local_providers(
                user=location_user,
                provider_type=recommended_type,
                animal_type_id=animal_type.id
            )

            ranked_providers = _score_and_rank_providers(providers_qs, max_count=2)

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

            # Match resources
            resource_keywords = result_dict.get('resource_keywords', [])
            matched_res = _match_resources(animal_type, resource_keywords, limit=2)
            resources_serialized = ResourceSerializer(
                matched_res, many=True, context={'request': request}
            ).data

            # Match govt vets if needed
            suggest_livestock_officer = result_dict.get('suggest_livestock_officer', False)
            if suggest_livestock_officer:
                govt_vets = _get_govt_vets(
                    animal_type,
                    division=loc_div,
                    district=loc_dist,
                    latitude=loc_lat,
                    longitude=loc_lng,
                )
                govt_vets_serialized = ServiceProviderSerializer(
                    govt_vets, many=True, context={'request': request}
                ).data

        # 6. Build response
        session_serialized = AISessionSerializer(session, context={'request': request}).data
        
        # Overwrite diagnostic_result for immediate feedback on this completion turn
        if session_complete:
            session_serialized['diagnostic_result'] = {
                'ai_response': result_dict,
                'query_type': query_type,
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

        response_data = {
            'reply': reply,
            'session': session_serialized,
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
