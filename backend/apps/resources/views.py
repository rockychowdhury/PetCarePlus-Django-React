"""
PetCarePlus v2 — Government Resources Views

API views for retrieving and managing GovtResource models.
Allows public read-only access and restricts creation/editing to admin users.
"""

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from common.permissions import IsAdminUser
from apps.resources.models import GovtResource
from apps.resources.serializers import GovtResourceSerializer


class GovtResourceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for GovtResource.
    Enables public view with filtering on division, district, and resource_type.
    """
    serializer_class = GovtResourceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['division', 'district', 'resource_type']
    search_fields = [
        'name_en', 'name_bn',
        'description_en', 'description_bn',
        'address_en', 'address_bn'
    ]

    def get_queryset(self):
        # Admins can view inactive resources in list/detail; others only active
        user = self.request.user
        if user and user.is_authenticated and user.role == 'admin':
            return GovtResource.objects.all()
        return GovtResource.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminUser()]
