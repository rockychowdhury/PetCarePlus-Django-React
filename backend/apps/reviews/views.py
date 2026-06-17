"""
PetCarePlus v2 — Reviews Views

API views for creating and retrieving reviews.
Exposes list and detail endpoints publicly, and restricts modifications to the owner.
"""

from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend

from common.permissions import IsOwnerOrAdmin
from apps.reviews.models import Review
from apps.reviews.serializers import ReviewSerializer


class ReviewViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Review management.
    Allows anyone to view reviews for service providers, but
    restricts creation to authenticated customers and updates to the review author.
    """
    serializer_class = ReviewSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['provider', 'rating', 'reviewer']
    ordering_fields = ['created_at', 'rating']
    ordering = ['-created_at']

    def get_queryset(self):
        provider_pk = self.kwargs.get('provider_pk')
        if provider_pk:
            return Review.objects.filter(provider_id=provider_pk)
        return Review.objects.all()

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

    def perform_create(self, serializer):
        # Automatically set reviewer and target provider based on the validated booking
        booking = serializer.validated_data['booking']
        serializer.save(
            reviewer=self.request.user,
            provider=booking.provider
        )
