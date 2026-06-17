"""
PetCarePlus v2 — Animals Views

API Views for AnimalType, Guideline, and VaccinationRecord models.
Provides public read access and limits creation/modification to admin users.
"""

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from common.permissions import IsAdminUser
from apps.animals.models import AnimalType, Guideline, VaccinationRecord
from apps.animals.serializers import (
    AnimalTypeSerializer,
    GuidelineSerializer,
    VaccinationRecordSerializer,
)


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


class GuidelineViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Guideline.
    Filters: animal_type, topic, season.
    Allows searching by title and content in both Bangla and English.
    """
    serializer_class = GuidelineSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['animal_type', 'animal_type__slug', 'topic', 'season']
    search_fields = [
        'title_en', 'title_bn',
        'content_en', 'content_bn',
        'summary_en', 'summary_bn'
    ]
    ordering_fields = ['created_at', 'title_en']
    ordering = ['-created_at']

    def get_queryset(self):
        # Public only sees published guidelines. Admins can see all.
        user = self.request.user
        if user and user.is_authenticated and user.role == 'admin':
            return Guideline.objects.all()
        return Guideline.objects.filter(is_published=True)

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminUser()]


class VaccinationRecordViewSet(viewsets.ModelViewSet):
    """
    ViewSet for VaccinationRecord.
    Filters: animal_type, animal_type__slug.
    Allows searching by vaccine name, disease, and local brand names in Bangladesh.
    """
    queryset = VaccinationRecord.objects.all()
    serializer_class = VaccinationRecordSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['animal_type', 'animal_type__slug']
    search_fields = [
        'vaccine_name_en', 'vaccine_name_bn',
        'disease_en', 'disease_bn',
        'local_medicine_name'
    ]
    ordering_fields = ['vaccine_name_en', 'created_at']
    ordering = ['animal_type', 'vaccine_name_en']

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsAdminUser()]
