"""
PetCarePlus v2 — Pets Views

API views for creating and managing companion pets.
Enforces owner-only boundaries and soft-deletes upon removal.
"""

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from common.permissions import IsOwnerOrAdmin
from apps.pets.models import Pet
from apps.pets.serializers import PetSerializer


class PetViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Pet profiles.
    Permits CRUD actions for authenticated pet owners on their own pets.
    """
    serializer_class = PetSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['animal_type', 'gender']
    search_fields = ['name', 'breed']

    def get_queryset(self):
        user = self.request.user
        
        # Admin can access all profiles
        if user.role == 'admin':
            return Pet.objects.all()
            
        # Standard users access their own active pet profiles
        return Pet.objects.filter(owner=user, is_active=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_destroy(self, instance):
        # Soft-delete: mark inactive instead of removing hard database record
        instance.is_active = False
        instance.save()
