"""
PetCarePlus v2 — Service Providers Views

API views for ServiceProvider profiles and their nested ProviderServices.
Implements local network cascade scoping, owner permissions, and soft-deletes.
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.views.decorators.vary import vary_on_headers

from django.db.models import Exists, OuterRef
from django.contrib.contenttypes.models import ContentType
from apps.accounts.models import SavedItem

from common.pagination import StandardPagination
from common.permissions import IsOwnerOrAdmin
from common.utils import get_local_providers
from apps.providers.models import ServiceProvider, ProviderService
from apps.providers.serializers import (
    ServiceProviderSerializer,
    ProviderServiceSerializer,
)


class ServiceProviderPagination(StandardPagination):
    page_size = 16



class ServiceProviderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ServiceProvider.
    Includes cascade regional location search (district -> division -> all)
    and restricts profile modifications to the owner or an admin.
    """
    serializer_class = ServiceProviderSerializer
    pagination_class = ServiceProviderPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['business_name', 'description_en', 'description_bn']

    def get_queryset(self):
        user = self.request.user
        
        # Admin gets everything
        if user and user.is_authenticated and user.role == 'admin':
            qs = ServiceProvider.objects.select_related('user', 'division', 'district', 'upazila', 'union').prefetch_related('services', 'animal_types__animal_type').all()
            return qs

        base_qs = ServiceProvider.objects.select_related('user', 'division', 'district', 'upazila', 'union').prefetch_related('services', 'animal_types__animal_type').filter(is_verified=True, is_active=True)

        # For detail views (retrieve, toggle_favorite), don't restrict by location cascade
        if getattr(self, 'action', None) != 'list':
            qs = base_qs
            if user and user.is_authenticated:
                ct = ContentType.objects.get_for_model(ServiceProvider)
                saved_subquery = SavedItem.objects.filter(
                    user=user,
                    content_type=ct,
                    object_id=OuterRef('pk')
                )
                qs = qs.annotate(is_saved=Exists(saved_subquery))
            return qs

        provider_type = self.request.query_params.get('provider_type')
        animal_type_id = self.request.query_params.get('animal_type')

        division_id = self.request.query_params.get('division_id')
        district_id = self.request.query_params.get('district_id')
        upazila_id = self.request.query_params.get('upazila_id')
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        
        has_location_params = division_id or district_id or upazila_id or (lat and lng)
        has_profile_location = user and user.is_authenticated and (getattr(user, 'district_id', None) or getattr(user, 'latitude', None))

        self._exact_match_found = True
        self._resolved_level = 'exact'

        # Apply cascade logic if location context is available
        if has_location_params or has_profile_location:
            qs, exact, level = get_local_providers(
                user=user if not has_location_params else None,
                provider_type=provider_type,
                animal_type_id=animal_type_id,
                lat=lat, lng=lng,
                division_id=division_id, district_id=district_id, upazila_id=upazila_id,
                base_qs=base_qs,
                return_metadata=True
            )
            self._exact_match_found = exact
            self._resolved_level = level
        else:
            qs = base_qs
            if provider_type:
                qs = qs.filter(provider_type=provider_type)
            if animal_type_id:
                qs = qs.filter(animal_types__animal_type_id=animal_type_id)

        if user and user.is_authenticated:
            ct = ContentType.objects.get_for_model(ServiceProvider)
            saved_subquery = SavedItem.objects.filter(
                user=user,
                content_type=ct,
                object_id=OuterRef('pk')
            )
            qs = qs.annotate(is_saved=Exists(saved_subquery))
            
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['exact_match_found'] = getattr(self, '_exact_match_found', True)
            response.data['resolved_level'] = getattr(self, '_resolved_level', 'exact')
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'exact_match_found': getattr(self, '_exact_match_found', True),
            'resolved_level': getattr(self, '_resolved_level', 'exact')
        })

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'provider':
            raise PermissionDenied("Only users with the 'provider' role can create a service provider profile.")
        if ServiceProvider.objects.filter(user=user).exists():
            raise ValidationError("A service provider profile already exists for this account.")
        
        # Default created profiles are unverified until checked by admin
        serializer.save(user=user, is_verified=False)

    from rest_framework.decorators import action
    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Returns the service provider profile of the currently authenticated user,
        even if it's unverified.
        """
        user = request.user
        if user.role != 'provider':
            raise PermissionDenied("Only providers can access this endpoint.")
            
        try:
            # We don't filter by is_verified here so providers can see their own unverified profile
            profile = ServiceProvider.objects.get(user=user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except ServiceProvider.DoesNotExist:
            return Response({'detail': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)





class ProviderServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProviderServices nested under a specific ServiceProvider.
    Ensures that only the owner of the provider profile can add or modify services.
    """
    serializer_class = ProviderServiceSerializer
    pagination_class = None

    def get_queryset(self):
        provider_pk = self.kwargs.get('provider_pk')
        return ProviderService.objects.filter(provider_id=provider_pk, is_active=True)




    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        provider_pk = self.kwargs.get('provider_pk')
        try:
            provider = ServiceProvider.objects.get(id=provider_pk)
        except ServiceProvider.DoesNotExist:
            raise ValidationError("Specified service provider does not exist.")

        # Authorisation check
        if provider.user != self.request.user and self.request.user.role != 'admin':
            raise PermissionDenied("You do not have permission to add services to this profile.")

        serializer.save(provider=provider)

    def perform_update(self, serializer):
        service = self.get_object()
        if service.provider.user != self.request.user and self.request.user.role != 'admin':
            raise PermissionDenied("You do not have permission to modify this service.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.provider.user != self.request.user and self.request.user.role != 'admin':
            raise PermissionDenied("You do not have permission to delete this service.")
        
        # Soft-delete: mark inactive instead of removing database record
        instance.is_active = False
        instance.save()
