"""
PetCarePlus v2 — Rehoming Views

API views for managing RehomingListings and RehomingApplications.
Includes cascade regional scoping for active listings and adoption transfer transactions.
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db.models import Q
from django_filters.rest_framework import DjangoFilterBackend

from common.permissions import IsOwnerOrAdmin
from common.utils import get_local_queryset
from apps.rehoming.models import RehomingListing, RehomingApplication
from apps.rehoming.serializers import (
    RehomingListingSerializer,
    RehomingApplicationSerializer,
)


class RehomingListingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RehomingListings.
    Active listings are filtered using a regional cascade scoping (district -> division -> all).
    """
    serializer_class = RehomingListingSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['reason', 'pet__name', 'pet__breed']

    def get_queryset(self):
        user = self.request.user
        
        # Admin views all listings
        if user and user.is_authenticated and user.role == 'admin':
            return RehomingListing.objects.all()

        # Public listings: only ACTIVE listings
        qs = RehomingListing.objects.filter(status=RehomingListing.Status.ACTIVE)

        # Scoped cascade logic for local network match
        if user and user.is_authenticated and user.district:
            return get_local_queryset(qs, user, location_field_prefix='owner__')

        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class RehomingApplicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for RehomingApplications.
    Customers see applications they submitted or received for their own pets.
    Handles ownership transfer and auto-rejection transactions upon approval.
    """
    serializer_class = RehomingApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return RehomingApplication.objects.none()

        if user.role == 'admin':
            return RehomingApplication.objects.all()

        # Users see applications they sent, or received on their listings
        return RehomingApplication.objects.filter(
            Q(applicant=user) | Q(listing__owner=user)
        )

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Auto-bind applicant
        serializer.save(applicant=self.request.user, status=RehomingApplication.Status.PENDING)

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        new_status = self.request.data.get('status')

        if new_status and new_status != instance.status:
            # 1. Authorisation: only listing owner or admin can approve/reject
            if instance.listing.owner != user and user.role != 'admin':
                raise PermissionDenied("Only the pet owner can approve or reject adoption applications.")

            if new_status == RehomingApplication.Status.APPROVED:
                # 2. Approve this application
                serializer.save(status=RehomingApplication.Status.APPROVED)

                # 3. Mark listing as ADOPTED
                listing = instance.listing
                listing.status = RehomingListing.Status.ADOPTED
                listing.save()

                # 4. Reject all other applications for this listing
                listing.applications.exclude(id=instance.id).update(status=RehomingApplication.Status.REJECTED)

                # 5. Transfer pet ownership to the approved applicant
                pet = listing.pet
                pet.owner = instance.applicant
                pet.save()
                return

        serializer.save()
