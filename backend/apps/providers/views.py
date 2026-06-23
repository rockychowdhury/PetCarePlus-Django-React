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
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_headers

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


@method_decorator(cache_page(60 * 15), name='list')
@method_decorator(vary_on_headers('Authorization', 'Cookie'), name='list')
@method_decorator(cache_page(60 * 15), name='retrieve')
@method_decorator(vary_on_headers('Authorization', 'Cookie'), name='retrieve')
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
            return ServiceProvider.objects.prefetch_related('animal_types').all()

        # For detail views (retrieve, toggle_favorite), don't restrict by location cascade
        if getattr(self, 'action', None) != 'list':
            return ServiceProvider.objects.prefetch_related('animal_types').filter(is_verified=True, is_active=True)

        provider_type = self.request.query_params.get('provider_type')
        animal_type_id = self.request.query_params.get('animal_type')

        # Check query parameters for explicit location scoping override
        division_id = self.request.query_params.get('division_id')
        district_id = self.request.query_params.get('district_id')
        upazila_id = self.request.query_params.get('upazila_id')
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        
        # Look up names from IDs
        from apps.locations.models import Division, District, Upazila
        division_name = None
        district_name = None
        upazila_name = None
        
        if division_id and division_id != 'all':
            division_name = Division.objects.filter(id=division_id).values_list('name_en', flat=True).first()
        if district_id:
            district_name = District.objects.filter(id=district_id).values_list('name_en', flat=True).first()
        if upazila_id:
            upazila_name = Upazila.objects.filter(id=upazila_id).values_list('name_en', flat=True).first()
            
        location_source = None
        if division_id == 'all':
            pass # Explicit override for nationwide search
        elif division_name or district_name or upazila_name or (lat and lng):
            class MockUser:
                def __init__(self, div, dist, upz, la, ln):
                    self.division = div
                    self.district = dist
                    self.upazila = upz
                    self.latitude = la
                    self.longitude = ln
            location_source = MockUser(division_name, district_name, upazila_name, lat, lng)
        elif user and user.is_authenticated and (user.district or user.latitude):
            # Fallback to user profile if no explicit search location is provided
            location_source = user

        # Apply cascade logic if location context is available
        if location_source:
            return get_local_providers(
                user=location_source,
                provider_type=provider_type,
                animal_type_id=animal_type_id
            )

        # Fallback: List all active verified service providers
        qs = ServiceProvider.objects.prefetch_related('animal_types').filter(is_verified=True, is_active=True)
        if provider_type:
            qs = qs.filter(provider_type=provider_type)
        if animal_type_id:
            qs = qs.filter(animal_types__animal_type_id=animal_type_id)
        return qs

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        
        user = self.request.user
        provider_type = request.query_params.get('provider_type')
        animal_type_id = request.query_params.get('animal_type')

        division_id = request.query_params.get('division_id')
        district_id = request.query_params.get('district_id')
        upazila_id = request.query_params.get('upazila_id')
        lat = request.query_params.get('lat')
        lng = request.query_params.get('lng')
        
        from apps.locations.models import Division, District, Upazila
        division_name = None
        district_name = None
        upazila_name = None
        
        if division_id and division_id != 'all':
            division_name = Division.objects.filter(id=division_id).values_list('name_en', flat=True).first()
        if district_id:
            district_name = District.objects.filter(id=district_id).values_list('name_en', flat=True).first()
        if upazila_id:
            upazila_name = Upazila.objects.filter(id=upazila_id).values_list('name_en', flat=True).first()
        
        location_source = None
        if division_id == 'all':
            pass # Explicit override for nationwide search
        elif division_name or district_name or upazila_name or (lat and lng):
            class MockUser:
                def __init__(self, div, dist, upz, la, ln):
                    self.division = div
                    self.district = dist
                    self.upazila = upz
                    self.latitude = la
                    self.longitude = ln
            location_source = MockUser(division_name, district_name, upazila_name, lat, lng)
        elif user and user.is_authenticated and (user.district or user.latitude):
            location_source = user

        exact_match_found = True
        resolved_level = 'exact'

        if location_source:
            base_qs = ServiceProvider.objects.filter(is_verified=True, is_active=True)
            if provider_type:
                base_qs = base_qs.filter(provider_type=provider_type)
            if animal_type_id:
                base_qs = base_qs.filter(animal_types__animal_type_id=animal_type_id)

            lat_val = getattr(location_source, 'latitude', None)
            lng_val = getattr(location_source, 'longitude', None)
            upazila_val = getattr(location_source, 'upazila', None)
            district_val = getattr(location_source, 'district', None)
            division_val = getattr(location_source, 'division', None)

            if lat_val and lng_val:
                try:
                    import math
                    lat_v = float(lat_val)
                    lng_v = float(lng_val)
                    lat_delta = 15.0 / 111.0
                    lng_delta = 15.0 / (111.0 * math.cos(math.radians(lat_v)))
                    radial_qs = base_qs.exclude(latitude__isnull=True).filter(
                        latitude__gte=lat_v - lat_delta,
                        latitude__lte=lat_v + lat_delta,
                        longitude__gte=lng_v - lng_delta,
                        longitude__lte=lng_v + lng_delta
                    )
                    from django.db import models
                    from django.db.models import F, ExpressionWrapper
                    from django.db.models.functions import ACos, Cos, Radians, Sin
                    lat_rad = Radians(lat_v)
                    lng_rad = Radians(lng_v)
                    distance_expr = ExpressionWrapper(
                        6371 * ACos(
                            Cos(lat_rad) * Cos(Radians(F('latitude'))) *
                            Cos(Radians(F('longitude')) - lng_rad) +
                            Sin(lat_rad) * Sin(Radians(F('latitude')))
                        ),
                        output_field=models.FloatField()
                    )
                    radial_qs = radial_qs.annotate(distance=distance_expr).filter(distance__lte=15.0)
                    if radial_qs.count() < 1:
                        exact_match_found = False
                        resolved_level = 'fallback'
                except (ValueError, TypeError):
                    exact_match_found = False
                    resolved_level = 'fallback'
            elif upazila_val:
                if base_qs.filter(upazila__iexact=upazila_val).count() < 1:
                    exact_match_found = False
                    resolved_level = 'fallback'
            elif district_val:
                if base_qs.filter(district__iexact=district_val).count() < 1:
                    exact_match_found = False
                    resolved_level = 'fallback'
            elif division_val:
                if base_qs.filter(division__iexact=division_val).count() < 1:
                    exact_match_found = False
                    resolved_level = 'fallback'

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            response = self.get_paginated_response(serializer.data)
            response.data['exact_match_found'] = exact_match_found
            response.data['resolved_level'] = resolved_level
            return response

        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'results': serializer.data,
            'exact_match_found': exact_match_found,
            'resolved_level': resolved_level
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
