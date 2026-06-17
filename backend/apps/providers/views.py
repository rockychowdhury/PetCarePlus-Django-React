"""
PetCarePlus v2 — Service Providers Views

API views for ServiceProvider profiles and their nested ProviderServices.
Implements local network cascade scoping, owner permissions, and soft-deletes.
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

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
            return ServiceProvider.objects.all()

        provider_type = self.request.query_params.get('provider_type')
        animal_type_id = self.request.query_params.get('animal_type')

        # Check query parameters for explicit location scoping override
        division = self.request.query_params.get('division')
        district = self.request.query_params.get('district')
        upazila = self.request.query_params.get('upazila')
        union = self.request.query_params.get('union')
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        
        location_source = None
        if division or district or upazila or union or (lat and lng):
            class MockUser:
                def __init__(self, div, dist, upz, uni, la, ln):
                    self.division = div
                    self.district = dist
                    self.upazila = upz
                    self.union = uni
                    self.latitude = la
                    self.longitude = ln
            location_source = MockUser(division, district, upazila, union, lat, lng)
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
        qs = ServiceProvider.objects.filter(is_verified=True, is_active=True)
        if provider_type:
            qs = qs.filter(provider_type=provider_type)
        if animal_type_id:
            qs = qs.filter(animal_types__animal_type_id=animal_type_id)
        return qs

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


class ProviderServiceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for ProviderServices nested under a specific ServiceProvider.
    Ensures that only the owner of the provider profile can add or modify services.
    """
    serializer_class = ProviderServiceSerializer

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
