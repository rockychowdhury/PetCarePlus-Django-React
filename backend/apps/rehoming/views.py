"""
PetCarePlus v2 — Rehoming Views

API views for managing RehomingListings and RehomingApplications.
Includes cascade regional scoping for active listings and adoption transfer transactions.
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.db.models import Q, F
from django_filters.rest_framework import DjangoFilterBackend
from django.utils.decorators import method_decorator
from django.views.decorators.vary import vary_on_headers

from common.permissions import IsOwnerOrAdmin
from common.utils import get_local_queryset
from apps.rehoming.models import RehomingListing, RehomingApplication
from apps.rehoming.serializers import (
    RehomingListingSerializer,
    RehomingApplicationSerializer,
)

from apps.rehoming.tasks import calculate_ai_score_task


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
            return RehomingListing.objects.select_related('owner', 'animal_type').all()

        # Public listings: only ACTIVE listings
        qs = RehomingListing.objects.select_related('owner', 'animal_type').filter(status=RehomingListing.Status.ACTIVE)

        # 1. Explicit district filter
        district = self.request.query_params.get('district')
        if district:
            qs = qs.filter(district__iexact=district)

        # 2. Distance filter
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius', 15)

        if lat and lng:
            try:
                lat_val = float(lat)
                lng_val = float(lng)
                radius_val = float(radius)

                import math
                valid_ids = []
                for listing in qs:
                    if listing.latitude and listing.longitude:
                        l_lat = float(listing.latitude)
                        l_lng = float(listing.longitude)
                        # Haversine distance
                        R = 6371
                        dlat = math.radians(l_lat - lat_val)
                        dlon = math.radians(l_lng - lng_val)
                        a = math.sin(dlat/2)**2 + math.cos(math.radians(lat_val)) * math.cos(math.radians(l_lat)) * math.sin(dlon/2)**2
                        c = 2 * math.asin(math.sqrt(a))
                        distance = R * c
                        if distance <= radius_val:
                            valid_ids.append(listing.id)
                qs = qs.filter(id__in=valid_ids)
            except (ValueError, TypeError):
                pass

        # 3. Scoped cascade logic for local network match (fallback)
        if not district and not (lat and lng) and user and user.is_authenticated and user.district:
            # We use 'owner__' so we can query both district and division securely via the User model
            return get_local_queryset(qs, user, location_field_prefix='owner__')

        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerOrAdmin()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    from rest_framework.decorators import action
    @action(detail=False, methods=['get'])
    def mine(self, request):
        """Returns all rehoming listings created by the current user (including adopted/cancelled)."""
        qs = RehomingListing.objects.select_related('owner', 'animal_type').filter(owner=request.user).order_by('-created_at')
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)



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
        return RehomingApplication.objects.select_related(
            'listing', 
            'applicant', 
            'listing__owner', 
            'listing__animal_type'
        ).filter(
            Q(applicant=user) | Q(listing__owner=user)
        ).order_by(F('ai_score').desc(nulls_last=True), '-created_at')

    def get_permissions(self):
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):

        
        # Build context for AI evaluation
        listing = serializer.validated_data.get('listing')
        message = serializer.validated_data.get('message', '')
        
        listing_details = (
            f"Pet Name: {listing.pet_name}\n"
            f"Breed: {listing.breed}\n"
            f"Description: {listing.description}\n"
            f"Adopter Requirements: {listing.adopter_requirements}\n"
        )
        
        # Save without AI score initially to prevent blocking the HTTP response
        application = serializer.save(
            applicant=self.request.user, 
            status=RehomingApplication.Status.PENDING,
            ai_score=None
        )

        # Trigger AI analysis synchronously
        calculate_ai_score_task(
            application.id,
            listing_details,
            message
        )

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        new_status = self.request.data.get('status')

        if new_status and new_status != instance.status:
            # 1. Authorisation:
            if new_status == RehomingApplication.Status.CANCELLED:
                # Only applicant can cancel
                if instance.applicant != user and user.role != 'admin':
                    raise PermissionDenied("Only the applicant can withdraw this application.")
            else:
                # Only listing owner or admin can approve/reject/review
                if instance.listing.owner != user and user.role != 'admin':
                    raise PermissionDenied("Only the pet owner can update adoption applications.")

            if new_status == RehomingApplication.Status.APPROVED:
                # 2. Approve this application
                serializer.save(status=RehomingApplication.Status.APPROVED)

                # 3. Mark listing as ADOPTED
                listing = instance.listing
                listing.status = RehomingListing.Status.ADOPTED
                listing.save()

                # 4. Reject all other applications for this listing
                listing.applications.exclude(id=instance.id).update(status=RehomingApplication.Status.REJECTED)
                return
                
            # If not approved, simply update the status (since status is read_only in serializer fields)
            serializer.save(status=new_status)
            return

        serializer.save()
