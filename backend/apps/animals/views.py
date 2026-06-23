"""
PetCarePlus v2 — Animals Views

API Views for AnimalType, Guideline, and VaccinationRecord models.
Provides public read access and limits creation/modification to admin users.
"""

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from common.permissions import IsAdminUser
from apps.animals.models import AnimalType
from apps.animals.serializers import AnimalTypeSerializer


from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

@method_decorator(cache_page(None), name='list')
@method_decorator(cache_page(None), name='retrieve')
class AnimalTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AnimalType.
    Allows public lists and details, but restricts modification to Admin users.
    """
    queryset = AnimalType.objects.all()
    serializer_class = AnimalTypeSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'supports_rehoming', 'supports_services']
    search_fields = ['name_en', 'name_bn', 'slug']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminUser()]



