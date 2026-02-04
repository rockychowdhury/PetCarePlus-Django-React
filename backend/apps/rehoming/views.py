from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, NotFound
from django.utils import timezone
from django.db.models import Q
from .models import RehomingListing, RehomingRequest, AdoptionInquiry
from .serializers import (
    ListingSerializer,
    ListingDetailSerializer,
    ListingCreateUpdateSerializer,
    RehomingRequestSerializer,
    AdoptionInquirySerializer
)
from apps.users.permissions import IsAdmin, IsOwnerOrReadOnly
from apps.common.logging_utils import log_business_event
import datetime
import math

class RehomingRequestViewSet(viewsets.ModelViewSet):
    """
    Manages Owner's Rehoming Requests (The intent to rehome).
    """
    serializer_class = RehomingRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RehomingRequest.objects.filter(owner=self.request.user)

    # Helper method _create_listing_from_request removed as it was unused

    def perform_create(self, serializer):
        user = self.request.user
        if not user.profile_is_complete:
            raise PermissionDenied("Complete your user profile before starting.")

        pet = serializer.validated_data.get('pet')
        
        # 1. Check for existing active requests
        existing = RehomingRequest.objects.filter(
            pet=pet,
            status__in=['cooling_period', 'confirmed', 'listed']
        ).exists()
        
        if existing:
            # Check if it was just a draft/cooling that got stuck, or real
            # For now, strict block:
            raise PermissionDenied("This pet already has an active rehoming request.")
            
        # 2. Validate terms acceptance
        if not serializer.validated_data.get('terms_accepted'):
            raise PermissionDenied("You must accept the terms to proceed.")

        # STREAMLINING: Auto-confirm immediately, removing cooling period.
        rehoming_status = 'confirmed'
        cooling_until = None
        
        # 3. Auto-populate location from user profile if not provided
        location_city = serializer.validated_data.get('location_city')
        if not location_city:
            location_city = user.location_city
            
        location_state = serializer.validated_data.get('location_state')
        if not location_state:
            location_state = user.location_state
            
        # Enforce location presence
        if not location_city or not location_state:
             raise PermissionDenied("Location is required. Please update your profile or provide a location manually.")

        instance = serializer.save(
            owner=user, 
            status=rehoming_status, 
            location_city=location_city,
            location_state=location_state,
            confirmed_at=timezone.now()
        )

        log_business_event('REHOMING_REQUEST_CREATED_AUTO_CONFIRMED', user, {
            'request_id': instance.id,
            'pet_id': pet.id,
            'pet_name': pet.name
        })

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publish the request: Create listing and mark request as listed."""
        rehoming_req = self.get_object()
        
        if rehoming_req.status == 'listed':
             raise PermissionDenied("Request is already listed.")
             
        if rehoming_req.status != 'confirmed':
             # Should be rare now with auto-confirm
             raise PermissionDenied("Request must be confirmed before publishing.")

        # Logic for creating listing here if we moved it from separate view, 
        # but for now we trust the separate ListingCreateView to handle it.
        # This action might be just for status update if listing is created elsewhere?
        # Actually ListingListCreateView handles creation. 
        # This 'publish' action seems to be defined but maybe not strictly used if we rely on Listing creation?
        # The ListingListCreateView doesn't update RehomingRequest status to 'listed'. 
        # We might want to ensure that happens.
        
        return Response({'status': 'confirmed', 'message': 'Ready to list'})

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """
        Confirm request.
        Legacy: Used to trigger after cooling period.
        Now: Idempotent success if already confirmed.
        """
        rehoming_req = self.get_object()
        
        if rehoming_req.status == 'confirmed':
             return Response({'status': 'confirmed'}, status=status.HTTP_200_OK)

        # Force confirm if for some reason it's not (e.g. old data)
        rehoming_req.status = 'confirmed'
        rehoming_req.confirmed_at = timezone.now()
        rehoming_req.save()
        
        return Response(self.get_serializer(rehoming_req).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel the rehoming request."""
        rehoming_req = self.get_object()
        rehoming_req.cancel(reason=request.data.get('reason', 'User cancelled'))
        return Response({'status': 'cancelled'})


class ListingListCreateView(generics.ListCreateAPIView):
    queryset = RehomingListing.objects.all()
    serializer_class = ListingSerializer
    
    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ListingCreateUpdateSerializer
        return ListingSerializer

    def get_queryset(self):
        from django.db.models import Count
        queryset = RehomingListing.objects.select_related('owner', 'pet').filter(status='active').annotate(
            application_count=Count('inquiries')
        )
        
        # Filtering logic
        params = self.request.query_params
        
        # 1. Text Search (Name, Breed, City)
        search_query = params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(pet__name__icontains=search_query) |
                Q(pet__breed__icontains=search_query) |
                Q(location_city__icontains=search_query)
            )

        # 2. Location & Geolocation Filtering
        location = params.get('location')
        nearby = params.get('nearby')
        
        if nearby:
            try:
                from django.db.models import F, FloatField, ExpressionWrapper, Value
                from django.db.models.functions import ACos, Cos, Radians, Sin, Greatest, Least
                
                parts = nearby.split(',')
                lat = float(parts[0])
                lng = float(parts[1])
                radius = float(parts[2]) if len(parts) > 2 else 50.0
                
                # Robust Cosine Calculation
                cos_calc = (
                    Cos(Radians(lat)) * Cos(Radians(F('latitude'))) *
                    Cos(Radians(F('longitude')) - Radians(lng)) +
                    Sin(Radians(lat)) * Sin(Radians(F('latitude')))
                )
                
                # Haversine formula (km) - 6371 is Earth's radius in km
                # Wrapped in Least/Greatest to prevent floating point domain errors for ACos
                queryset = queryset.annotate(
                    distance=ExpressionWrapper(
                        6371 * ACos(
                            Least(Greatest(cos_calc, Value(-1.0)), Value(1.0))
                        ),
                        output_field=FloatField()
                    )
                )

                # Filter: Within radius OR legacy location match (if location provided)
                # This ensures items with missing coordinates but matching city still appear
                location_filter = Q(distance__lte=radius)
                if location:
                    location_filter |= (
                        Q(location_city__icontains=location) | 
                        Q(location_state__icontains=location)
                    )
                
                queryset = queryset.filter(location_filter).order_by(F('distance').asc(nulls_last=True), '-published_at')
            except (ValueError, IndexError, TypeError):
                if location:
                    queryset = queryset.filter(
                        Q(location_city__icontains=location) |
                        Q(location_state__icontains=location)
                    )
        elif location:
            # Legacy/Manual Location name search only
            queryset = queryset.filter(
                Q(location_city__icontains=location) |
                Q(location_state__icontains=location)
            )
        
        # 3. Standard Filters
        species = params.get('species')
        if species: queryset = queryset.filter(pet__species__iexact=species)
        
        breed = params.get('breed')
        if breed: queryset = queryset.filter(pet__breed__icontains=breed)

        gender = params.get('gender')
        if gender: queryset = queryset.filter(pet__gender__iexact=gender)
        
        urgency = params.get('urgency_level')
        if urgency: queryset = queryset.filter(urgency=urgency)
        
        # 4. New Filters (Size, Age, Traits, Verification)
        
        # Size
        size = params.get('size')
        if size:
            # Map frontend 'xs','s','m' etc if needed, or assume frontend sends compatible values.
            # Frontend plan: update to send 'small', 'medium', 'large'
            queryset = queryset.filter(pet__size_category__iexact=size)

        # Age Range
        age_range = params.get('age_range')
        if age_range:
            today = datetime.date.today()
            if age_range == 'baby' or age_range == 'under_6_months':
                start_date = today - datetime.timedelta(days=365)
                queryset = queryset.filter(pet__birth_date__gte=start_date)
            elif age_range == 'adult' or age_range == '1_3_years' or age_range == '3_10_years':
                start_date = today - datetime.timedelta(days=365*10)
                end_date = today - datetime.timedelta(days=365)
                queryset = queryset.filter(pet__birth_date__range=(start_date, end_date))
            elif age_range == 'senior' or age_range == '10_plus_years':
                end_date = today - datetime.timedelta(days=365*10)
                queryset = queryset.filter(pet__birth_date__lt=end_date)
            elif age_range == '6_12_months':
                # Keep legacy support if needed, though frontend won't send it
                start_date = today - datetime.timedelta(days=365)
                end_date = today - datetime.timedelta(days=180)
                queryset = queryset.filter(pet__birth_date__range=(start_date, end_date))

        # Traits (Compatibility)
        # Assuming frontend sends 'true' for checked boxes
        if params.get('good_with_children') == 'true':
            queryset = queryset.filter(pet__traits__name__iexact='Good with Children')
        
        if params.get('good_with_dogs') == 'true':
            queryset = queryset.filter(pet__traits__name__iexact='Good with Dogs')
            
        if params.get('good_with_cats') == 'true':
             queryset = queryset.filter(pet__traits__name__iexact='Good with Cats')
             
        if params.get('house_trained') == 'true':
             queryset = queryset.filter(pet__traits__name__iexact='House Trained')

        # Verification
        if params.get('verified_owner') == 'true': # verification_identity in Plan, verified_owner in frontend state
             # Mapping 'verified_owner' filter to 'verified_identity' model field? 
             # Or 'pet_owner_verified'? Let's use verified_identity as per plan.
             queryset = queryset.filter(owner__verified_identity=True)

        if params.get('verified_identity') == 'true':
             queryset = queryset.filter(owner__verified_identity=True)

        # Ordering
        ordering = params.get('ordering', '-published_at')
        if ordering in ['published_at', '-published_at', 'created_at', '-created_at']:
            queryset = queryset.order_by(ordering)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        # Gate 1: Profile
        if not user.can_create_listing:
             raise PermissionDenied("Profile verification required.")
             
        # Gate 2: Must have a CONFIRMED RehomingRequest
        request_id = self.request.data.get('request_id')
        if not request_id:
            raise PermissionDenied("Rehoming Request ID required.")
            
        try:
            rehoming_req = RehomingRequest.objects.get(id=request_id, owner=user)
        except RehomingRequest.DoesNotExist:
            raise NotFound("Rehoming Request not found.")
            
        if rehoming_req.status != 'confirmed':
             raise PermissionDenied("Rehoming Request is not confirmed.")

        # Gate 3: Listing must not already exist
        if hasattr(rehoming_req, 'listing'):
            from rest_framework.exceptions import ValidationError
            raise ValidationError("A listing already exists for this request.")
             
        # Create Listing linked to request
        listing = serializer.save(
            owner=user, 
            request=rehoming_req,
            pet=rehoming_req.pet,  # Use pet from request
            # Copy fields for context
            reason=rehoming_req.reason,
            urgency=rehoming_req.urgency,
            ideal_home_notes=rehoming_req.ideal_home_notes,
            location_city=rehoming_req.location_city,
            location_state=rehoming_req.location_state,
            latitude=rehoming_req.latitude,
            longitude=rehoming_req.longitude
        )

        log_business_event('REHOMING_LISTING_CREATED', user, {
            'listing_id': listing.id,
            'request_id': rehoming_req.id,
            'pet_id': rehoming_req.pet.id
        })

        # Update Request Status to 'listed' so it doesn't show as a draft anymore
        rehoming_req.status = 'listed'
        rehoming_req.save()


class ListingRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RehomingListing.objects.all()
    serializer_class = ListingDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated(), IsOwnerOrReadOnly()]


class AdoptionInquiryViewSet(viewsets.ModelViewSet):
    """
    Manages Adopter Inquiries (formerly RehomingRequest).
    """
    serializer_class = AdoptionInquirySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return AdoptionInquiry.objects.filter(
            Q(requester=user) | Q(listing__owner=user)
        ).select_related('listing', 'requester').distinct()

    http_method_names = ['get', 'post', 'head', 'options']

    def perform_create(self, serializer):
        listing = serializer.validated_data['listing']
        if listing.owner == self.request.user:
             raise PermissionDenied("You cannot request your own pet.")
        
        if AdoptionInquiry.objects.filter(listing=listing, requester=self.request.user).exists():
             raise PermissionDenied("You have already sent an inquiry for this pet.")
             
        instance = serializer.save(requester=self.request.user)

        # Trigger Async AI Match Analysis
        from .tasks import analyze_application_match
        analyze_application_match.delay(instance.id)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        inquiry = self.get_object()
        
        # Only the pet owner can update status
        if inquiry.listing.owner != request.user:
            raise PermissionDenied("Only the pet owner can update the application status.")

        new_status = request.data.get('status')
        owner_notes = request.data.get('owner_notes')
        rejection_reason = request.data.get('rejection_reason')

        if not new_status:
            return Response({'error': 'Status is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Simplified state machine
        allowed_transitions = {
            'pending_review': ['approved_meet_greet', 'rejected'],
            'approved_meet_greet': ['adopted', 'rejected', 'withdrawn'],
            'adopted': [], # Final state
            'rejected': [], # Final state
        }

        current_status = inquiry.status
        if new_status not in allowed_transitions.get(current_status, []):
            # Allow admin override or specialized cases? For now, strict.
            # actually, maybe just allow if not in final state?
            if current_status in ['adopted', 'rejected']:
                 return Response({'error': f'Application is already {current_status}.'}, status=status.HTTP_400_BAD_REQUEST)
        
        inquiry.status = new_status
        if owner_notes: 
            inquiry.owner_notes = owner_notes
        if rejection_reason: 
            inquiry.rejection_reason = rejection_reason
        
        # Assuming model has generic JSON or fields. 
        # But wait, serializer didn't show those fields.
        # Let's save logic first.
        
        inquiry.save()
        
        if new_status == 'adopted':
            listing = inquiry.listing
            listing.mark_as_rehomed(new_owner=inquiry.requester)
            
            # Automatically reject other pending/approved applications
            other_inquiries = listing.inquiries.exclude(id=inquiry.id).exclude(status__in=['rejected', 'withdrawn'])
            count = other_inquiries.count()
            other_inquiries.update(
                status='rejected',
                rejection_reason="Pet has been rehomed to another applicant."
            )
            # Log this bulk action if logging exists
            # print(f"Auto-rejected {count} other applications for listing {listing.id}")

        return Response(AdoptionInquirySerializer(inquiry).data)

class MyListingListView(generics.ListAPIView):
    serializer_class = ListingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return RehomingListing.objects.filter(owner=self.request.user).order_by('-updated_at')


class GenerateAIApplicationView(generics.CreateAPIView):
    """
    Generates AI-powered application content based on user inputs.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        from .services.ai_service import generate_application_content
        
        listing_id = request.data.get('listing_id')
        form_data = request.data.get('form_data', {})
        
        if not listing_id:
            return Response({'error': 'Listing ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            listing = RehomingListing.objects.get(id=listing_id)
        except RehomingListing.DoesNotExist:
            return NotFound("Listing not found")
            
        try:
            generated_content = generate_application_content(request.user, listing, form_data)
            return Response({'content': generated_content})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
