"""
PetCarePlus v2 — Resources Views

API views for retrieving and managing Resource models.
Allows public read-only access and restricts creation/editing to admin users.
"""

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from common.permissions import IsAdminUser
from apps.resources.models import Resource
from apps.resources.serializers import ResourceSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Resource.
    Enables public view with filtering on resource_type and animal_type.
    """
    serializer_class = ResourceSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['resource_type', 'animal_type']
    search_fields = [
        'title_en', 'title_bn',
        'description_en', 'description_bn'
    ]

    def get_queryset(self):
        # Admins can view inactive resources in list/detail; others only active
        user = self.request.user
        if user and user.is_authenticated and user.role == 'admin':
            return Resource.objects.all()
        return Resource.objects.filter(is_active=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminUser()]
