from rest_framework import viewsets, permissions, filters, parsers, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.db.models import Q, Sum, Avg, Count, F, Value, FloatField
from django.db.models.functions import Coalesce
from apps.common.logging_utils import log_business_event

from .models import (
    ServiceProvider, ServiceReview, ServiceCategory, 
    Species, ServiceOption, ServiceBooking, Specialization,
    BusinessHours, ServiceMedia,
    VeterinaryClinic, FosterService, TrainerService, GroomerService, PetSitterService
)
from .serializers import (
    ServiceProviderSerializer, ServiceReviewSerializer,
    ServiceCategorySerializer, SpeciesSerializer, ServiceOptionSerializer,
    ServiceBookingSerializer, ServiceBookingCreateSerializer, SpecializationSerializer,
    VeterinaryClinicSerializer, FosterServiceSerializer, TrainerServiceSerializer,
    GroomerServiceSerializer, PetSitterServiceSerializer
)

class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceCategory.objects.all()
    serializer_class = ServiceCategorySerializer
    permission_classes = [permissions.AllowAny]

class SpeciesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Species.objects.all()
    serializer_class = SpeciesSerializer
    permission_classes = [permissions.AllowAny]

class ServiceOptionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ServiceOption.objects.all()
    serializer_class = ServiceOptionSerializer
    permission_classes = [permissions.AllowAny]

class SpecializationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Specialization.objects.all()
    serializer_class = SpecializationSerializer
    permission_classes = [permissions.AllowAny]

class BaseServiceDetailViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    lookup_field = 'provider__id' # Lookup by provider ID

class VeterinaryServiceViewSet(BaseServiceDetailViewSet):
    queryset = VeterinaryClinic.objects.all()
    serializer_class = VeterinaryClinicSerializer

class FosterServiceViewSet(BaseServiceDetailViewSet):
    queryset = FosterService.objects.all()
    serializer_class = FosterServiceSerializer

class TrainerServiceViewSet(BaseServiceDetailViewSet):
    queryset = TrainerService.objects.all()
    serializer_class = TrainerServiceSerializer

class GroomerServiceViewSet(BaseServiceDetailViewSet):
    queryset = GroomerService.objects.all()
    serializer_class = GroomerServiceSerializer

class PetSitterServiceViewSet(BaseServiceDetailViewSet):
    queryset = PetSitterService.objects.all()
    serializer_class = PetSitterServiceSerializer

class ServiceProviderFilter(django_filters.FilterSet):
    species = django_filters.CharFilter(method='filter_species') # Slug or name
    availability = django_filters.CharFilter(method='filter_availability')
    min_rating = django_filters.NumberFilter(method='filter_min_rating')
    services = django_filters.CharFilter(method='filter_services')
    
    # Filter by category slug
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='iexact')

    # Aliases for location
    location_city = django_filters.CharFilter(field_name='city', lookup_expr='icontains')
    location_state = django_filters.CharFilter(field_name='state', lookup_expr='iexact')

    class Meta:
        model = ServiceProvider
        fields = ['city', 'state', 'verification_status', 'nearby']
    
    nearby = django_filters.CharFilter(method='filter_nearby')

    def filter_species(self, queryset, name, value):
        # Support slug or name lookup across all service types
        return queryset.filter(
            Q(foster_details__species_accepted__slug__iexact=value) |
            Q(foster_details__species_accepted__name__icontains=value) |
            Q(vet_details__species_treated__slug__iexact=value) |
            Q(vet_details__species_treated__name__icontains=value) |
            Q(vet_details__species_treated__slug__iexact=value) |
            Q(vet_details__species_treated__name__icontains=value) |
            Q(trainer_details__species_trained__slug__iexact=value) |
            Q(trainer_details__species_trained__name__icontains=value) |
            Q(groomer_details__species_accepted__slug__iexact=value) |
            Q(groomer_details__species_accepted__name__icontains=value) |
            Q(sitter_details__species_accepted__slug__iexact=value) |
            Q(sitter_details__species_accepted__name__icontains=value)
        ).distinct()

    def filter_availability(self, queryset, name, value):
        if value.lower() == 'available':
            return queryset.filter(
                Q(foster_details__current_availability='available') |
                Q(trainer_details__accepting_new_clients=True)
            )
        return queryset

    def filter_services(self, queryset, name, value):
        # Filter by ServiceOption name or Category
        return queryset.filter(
            Q(vet_details__services_offered__name__icontains=value) |
            Q(category__name__icontains=value) |
            # For groomers, check json menu?? Not easy with basic filter. 
            # Check salon type for groomer
            Q(groomer_details__salon_type__icontains=value)
        ).distinct()

    def filter_nearby(self, queryset, name, value):
        """
        Accurate radius filtering using haversine distance formula.
        Expected format: lat,lng,radius_km (optional, default 10)
        Example: ?nearby=23.8103,90.4125,5
        """
        try:
            from django.db.models import F, FloatField, ExpressionWrapper
            from django.db.models.functions import ACos, Cos, Radians, Sin
            
            parts = value.split(',')
            lat = float(parts[0])
            lng = float(parts[1])
            radius_km = float(parts[2]) if len(parts) > 2 else 10.0
            
            # Haversine formula: calculate great-circle distance
            # distance = 6371 * acos(cos(lat1) * cos(lat2) * cos(lng2 - lng1) + sin(lat1) * sin(lat2))
            queryset = queryset.annotate(
                distance=ExpressionWrapper(
                    6371 * ACos(
                        Cos(Radians(lat)) * Cos(Radians(F('latitude'))) *
                        Cos(Radians(F('longitude')) - Radians(lng)) +
                        Sin(Radians(lat)) * Sin(Radians(F('latitude')))
                    ),
                    output_field=FloatField()
                )
            ).filter(
                distance__lte=radius_km
            ).order_by('distance')
            
            return queryset
        except (ValueError, IndexError, TypeError):
            return queryset
            
    def filter_min_rating(self, queryset, name, value):
        return queryset.filter(avg_rating__gte=value)

class ServiceReviewFilter(django_filters.FilterSet):
    rating_min = django_filters.NumberFilter(field_name="rating_overall", lookup_expr='gte')
    rating_max = django_filters.NumberFilter(field_name="rating_overall", lookup_expr='lte')
    has_response = django_filters.BooleanFilter(method='filter_has_response')
    category_slug = django_filters.CharFilter(field_name="category__slug")
    category_id = django_filters.NumberFilter(field_name="category__id")
    verified_only = django_filters.BooleanFilter(field_name="verified_client")

    class Meta:
        model = ServiceReview
        fields = ['provider', 'reviewer', 'rating_overall', 'verified_client', 'category_slug', 'category_id']

    def filter_has_response(self, queryset, name, value):
        if value is True:
            return queryset.filter(provider_response__isnull=False).exclude(provider_response='')
        elif value is False:
            return queryset.filter(Q(provider_response__isnull=True) | Q(provider_response=''))
        return queryset

class ServiceProviderViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = ServiceProvider.objects.annotate(
            avg_rating=Coalesce(Avg('reviews__rating_overall'), Value(0.0, output_field=FloatField())),
            avg_communication=Coalesce(Avg('reviews__rating_communication'), Value(0.0, output_field=FloatField())),
            avg_cleanliness=Coalesce(Avg('reviews__rating_cleanliness'), Value(0.0, output_field=FloatField())),
            avg_quality=Coalesce(Avg('reviews__rating_quality'), Value(0.0, output_field=FloatField())),
            avg_value=Coalesce(Avg('reviews__rating_value'), Value(0.0, output_field=FloatField())),
            reviews_count=Count('reviews')
        ).select_related('user', 'category').prefetch_related(
            'vet_details', 'foster_details', 'trainer_details', 
            'groomer_details', 'sitter_details', 'hours'
        ).order_by('-created_at')
        
        user = self.request.user
        
        # If detail view, allow access if it's the owner or admin, otherwise must be verified
        if self.action == 'retrieve':
            return queryset
            
        # For list actions
        if self.action == 'list':
             # Admin saw everything
             if user.is_staff:
                  return queryset
             # Public sees verified
             return queryset.filter(verification_status='verified')
        
        # For authenticated user queries (dashboard etc)
        if user.is_authenticated:
             if user.is_staff:
                  return queryset
             # Allow user to see their own profile even if unverified/draft
             return queryset.filter(Q(verification_status='verified') | Q(user=user))
            
        return queryset.filter(verification_status='verified')
    serializer_class = ServiceProviderSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ServiceProviderFilter
    search_fields = ['business_name', 'description', 'category__name', 'city']
    ordering_fields = ['avg_rating', 'reviews_count', 'created_at', 'business_name', 'distance']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        user = self.request.user
        # Allow any user to create a provider profile (starts as submitted for admin review)
        
        if ServiceProvider.objects.filter(user=user).exists():
             raise permissions.exceptions.PermissionDenied("You already have a Service Provider profile.")

        # Save as submitted
        instance = serializer.save(user=user, application_status='submitted', verification_status='pending')
        
        # Create Role Request automatically so admin can approve the role change
        from apps.users.models import RoleRequest, User as UserModel
        RoleRequest.objects.create(
            user=user,
            requested_role=UserModel.UserRole.SERVICE_PROVIDER,
            reason="Automated role request from service provider registration.",
            status='pending'
        )

        log_business_event('SERVICE_PROVIDER_PROFILE_CREATED', user, {
            'provider_id': instance.id,
            'business_name': instance.business_name
        })
        log_business_event('PROVIDER_APPLICATION_SUBMITTED', user, {'provider_id': instance.id})

    def perform_update(self, serializer):
        # Prevent updates if status is submitted (locked)
        instance = serializer.instance
        if instance.application_status == 'submitted' and not self.request.user.is_staff:
             raise permissions.exceptions.PermissionDenied("Your application is under review and cannot be edited.")
        serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def submit_application(self, request, pk=None):
        provider = self.get_object()
        user = request.user
        
        if provider.user != user:
             return Response({"error": "Not authorized"}, status=403)
             
        if provider.application_status != 'draft':
             return Response({"error": "Application is not in draft status."}, status=400)
             
        # Create Role Request
        from apps.users.models import RoleRequest, User
        RoleRequest.objects.create(
            user=user,
            requested_role=User.UserRole.SERVICE_PROVIDER,
            reason="Application submitted via provider portal.",
            status='pending'
        )
        
        provider.application_status = 'submitted'
        provider.verification_status = 'pending'
        provider.save()
        
        log_business_event('PROVIDER_APPLICATION_SUBMITTED', user, {'provider_id': provider.id})
        return Response(self.get_serializer(provider).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def review(self, request, pk=None):
        provider = self.get_object()
        serializer = ServiceReviewSerializer(data=request.data)
        if serializer.is_valid():
            review = serializer.save(provider=provider, reviewer=request.user)
            log_business_event('SERVICE_REVIEW_CREATED', request.user, {
                'review_id': review.id,
                'provider_id': provider.id,
                'rating': review.rating_overall
            })
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated], url_path='reviews/(?P<review_id>[^/.]+)/respond')
    def respond_to_review(self, request, pk=None, review_id=None):
        """Allow provider to respond to a review"""
        provider = self.get_object()
        
        # Check provider owns this profile
        if provider.user != request.user:
            return Response({"error": "Not authorized"}, status=403)
        
        try:
            review = ServiceReview.objects.get(id=review_id, provider=provider)
        except ServiceReview.DoesNotExist:
            return Response({"error": "Review not found"}, status=404)
        
        response_text = request.data.get('response')
        if not response_text:
            return Response({"error": "Response text is required"}, status=400)
        
        # Update review with response
        from django.utils import timezone
        review.provider_response = response_text
        review.response_date = timezone.now()
        review.save()
        
        serializer = ServiceReviewSerializer(review)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def availability_blocks(self, request, pk=None):
        """List or create availability blocks for a provider"""
        provider = self.get_object()
        
        # Check ownership
        if provider.user != request.user:
            return Response({"error": "Not authorized"}, status=403)
        
        if request.method == 'GET':
            from .models import ProviderAvailabilityBlock
            from .serializers import ProviderAvailabilityBlockSerializer
            blocks = ProviderAvailabilityBlock.objects.filter(provider=provider)
            serializer = ProviderAvailabilityBlockSerializer(blocks, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            from .serializers import ProviderAvailabilityBlockSerializer
            serializer = ProviderAvailabilityBlockSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(provider=provider)
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)
    
    @action(
        detail=True,
        methods=['delete'],
        permission_classes=[permissions.IsAuthenticated],
        url_path='availability_blocks/(?P<block_id>[^/.]+)'
    )
    def delete_availability_block(self, request, pk=None, block_id=None):
        """Delete a specific availability block"""
        provider = self.get_object()
        
        # Check ownership
        if provider.user != request.user:
            return Response({"error": "Not authorized"}, status=403)
        
        try:
            from .models import ProviderAvailabilityBlock
            block = ProviderAvailabilityBlock.objects.get(id=block_id, provider=provider)
            block.delete()
            return Response({"message": "Block deleted successfully"}, status=204)
        except ProviderAvailabilityBlock.DoesNotExist:
            return Response({"error": "Block not found"}, status=404)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        try:
            provider = ServiceProvider.objects.get(user=request.user)
            serializer = self.get_serializer(provider)
            return Response(serializer.data)
        except ServiceProvider.DoesNotExist:
            return Response({"detail": "No service provider profile found."}, status=404)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_hours(self, request, pk=None):
        provider = self.get_object()
        # Expect list of hour objects
        hours_data = request.data
        if not isinstance(hours_data, list):
            return Response({"error": "Expected a list of hours."}, status=400)
            
        # Delete existing
        provider.hours.all().delete()
        
        # Create new
        new_hours = []
        for h in hours_data:
            new_hours.append(BusinessHours(
                provider=provider,
                day=h.get('day'),
                open_time=h.get('open_time') or None,
                close_time=h.get('close_time') or None,
                is_closed=h.get('is_closed', False)
            ))
        BusinessHours.objects.bulk_create(new_hours)
        
        return Response(self.get_serializer(provider).data)
        
    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny], url_path='availability')
    def availability(self, request, pk=None):
        """Get availability for a provider (Contract 3.4)"""
        provider = self.get_object()
        
        # Default to checking next 7 days or specific date from query param
        date_str = request.query_params.get('date')
        
        try:
            from datetime import datetime, time, timedelta
            from django.utils import timezone
            
            # Logic adapted from 'check_availability'
            if date_str:
                 target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            else:
                 target_date = timezone.now().date() # Default to today
                 
            day_of_week = target_date.weekday()
            
             # Get business hours for this day
            try:
                business_hour = provider.hours.get(day=day_of_week)
                is_closed = business_hour.is_closed
                open_time = business_hour.open_time
                close_time = business_hour.close_time
            except BusinessHours.DoesNotExist: 
                # Default hours if not set
                from datetime import time
                is_closed = False
                open_time = time(9, 0)
                close_time = time(18, 0)

            if is_closed:
                 return Response({
                    "date": target_date,
                    "is_open": False,
                    "business_hours": None,
                    "available_slots": []
                 })
                 
            # Generate slots logic... (Simplified for brevity, or copied fully?)
            # Since I am moving it, I should implement full logic or call a helper.
            # I'll implement a concise version.
            
            available_slots = []
            if open_time and close_time:
                current_time = datetime.combine(target_date, open_time)
                end_time = datetime.combine(target_date, close_time)
                slot_duration = timedelta(hours=1)
                
                day_start = timezone.make_aware(datetime.combine(target_date, time(0, 0)))
                day_end = timezone.make_aware(datetime.combine(target_date, time(23, 59, 59)))
                
                bookings = ServiceBooking.objects.filter(
                    provider=provider,
                    status__in=['confirmed', 'pending'],
                    start_datetime__gte=day_start,
                    start_datetime__lt=day_end
                )
                
                while current_time < end_time:
                    slot_start = timezone.make_aware(current_time)
                    slot_end = slot_start + slot_duration
                    
                    conflicts = bookings.filter(
                        start_datetime__lt=slot_end,
                        end_datetime__gt=slot_start
                    ).count()
                    
                    is_available = True
                    capacity = 1
                    if hasattr(provider, 'foster_details'):
                         capacity = provider.foster_details.capacity or 1
                         is_available = conflicts < capacity
                    else:
                         is_available = conflicts == 0
                         
                    if is_available:
                        # Only adding available slots to list per contract usually? 
                        # Or contract says "available_slots": ["09:00", ...]
                        available_slots.append(current_time.strftime('%H:%M'))
                        
                    current_time += slot_duration

            return Response({
                "date": target_date,
                "is_open": True,
                "business_hours": {
                    "open": open_time.strftime('%H:%M'),
                    "close": close_time.strftime('%H:%M')
                },
                "available_slots": available_slots
            })
            
        except ValueError:
            return Response({"error": "Invalid date format"}, status=400)

    @action(
        detail=True, 
        methods=['post'], 
        permission_classes=[permissions.IsAuthenticated],
        url_path='media'
    )
    def upload_media(self, request, pk=None):
        """Add media to provider (expects URL from ImgBB uploaded by client)"""
        provider = self.get_object()
        
        if provider.user != request.user:
            return Response({"error": "Not authorized"}, status=403)
        
        # Handle if data is sent as a list (take first item)
        data = request.data
        if isinstance(data, list):
            if not data:
                return Response({"error": "No media data provided"}, status=400)
            data = data[0]
        
        # Expect JSON with file_url, thumbnail_url (optional)
        file_url = data.get('file_url')
        if not file_url:
            return Response({
                "error": "file_url is required",
                "hint": "Upload image to ImgBB on client-side first, then send the URL",
                "received_data_type": type(request.data).__name__,
                "received_data": str(request.data)[:200]
            }, status=400)
        
        thumbnail_url = data.get('thumbnail_url') or file_url
        is_primary = data.get('is_primary', False)
        alt_text = data.get('alt_text', '')
        
        # If setting as primary, unset other primary images
        if is_primary:
            ServiceMedia.objects.filter(provider=provider, is_primary=True).update(is_primary=False)
        
        media = ServiceMedia.objects.create(
            provider=provider,
            file_url=file_url,
            thumbnail_url=thumbnail_url,
            is_primary=is_primary,
            alt_text=alt_text
        )
        
        from .serializers import ServiceMediaSerializer
        return Response(ServiceMediaSerializer(media).data, status=201)

    @action(detail=True, methods=['get'], permission_classes=[permissions.AllowAny], url_path='reviews')
    def list_reviews(self, request, pk=None):
        """List reviews for a provider with filtering"""
        provider = self.get_object()
        queryset = provider.reviews.all().order_by('-created_at')
        
        # Filtering
        min_rating = request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating_overall__gte=min_rating)
            
        verified_only = request.query_params.get('verified_only')
        if verified_only and verified_only.lower() == 'true':
            queryset = queryset.filter(verified_client=True)
            
        # Pagination
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = ServiceReviewSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
            
        serializer = ServiceReviewSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def update_status(self, request, pk=None):
        provider = self.get_object()
        status = request.data.get('status')
        if status not in ['pending', 'verified', 'rejected']:
             return Response({"error": "Invalid status."}, status=400)
        
        provider.verification_status = status
        provider.save()
        log_business_event('PROVIDER_STATUS_UPDATED', request.user, {
            'provider_id': provider.id,
            'new_status': status
        })
        return Response(self.get_serializer(provider).data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def dashboard_stats(self, request):
        """
        Get aggregated stats for the logged-in provider.
        """
        user = request.user
        if not hasattr(user, 'service_provider_profile'):
             return Response({"error": "User is not a service provider"}, status=403)
        
        provider = user.service_provider_profile
        bookings = ServiceBooking.objects.filter(provider=provider)
        
        from django.utils import timezone
        now = timezone.now()
        thirty_days_ago = now - timezone.timedelta(days=30)
        
        total_bookings = bookings.count()
        pending_bookings = bookings.filter(status='pending').count()
        completed_bookings = bookings.filter(status='completed').count()
        
        # Earnings (sum of agreed_price for non-cancelled/refunded bookings)
        valid_bookings = bookings.exclude(status='cancelled').exclude(payment_status='refunded')
        total_earnings = valid_bookings.aggregate(total=Sum('agreed_price'))['total'] or 0
        
        # Monthly stats
        month_bookings = bookings.filter(created_at__gte=thirty_days_ago).count()
        month_earnings = valid_bookings.filter(created_at__gte=thirty_days_ago).aggregate(total=Sum('agreed_price'))['total'] or 0
        
        # Recent bookings (upcoming, ordered by booking_date)
        from .serializers import ServiceBookingSerializer
        recent_bookings = bookings.filter(
            booking_date__gte=now.date()
        ).order_by('booking_date', 'booking_time')[:5]
        
        # Recent reviews
        from .serializers import ServiceReviewSerializer
        all_recent_reviews = provider.reviews.order_by('-created_at')
        pending_reviews_count = all_recent_reviews.filter(provider_response__isnull=True).count()
        recent_reviews = all_recent_reviews[:5]
        
        # Today's schedule
        today_bookings = bookings.filter(
            booking_date=now.date(),
            status__in=['confirmed', 'pending']
        ).order_by('booking_time')
        
        return Response({
            "total_bookings": total_bookings,
            "pending_bookings": pending_bookings,
            "completed_bookings": completed_bookings,
            "total_earnings": total_earnings,
            "this_month": {
                "bookings": month_bookings,
                "earnings": month_earnings
            },
            "rating": provider.average_rating,
            "reviews": provider.review_count,
            "pending_reviews_count": pending_reviews_count,
            "recent_bookings": ServiceBookingSerializer(recent_bookings, many=True).data,
            "recent_reviews": ServiceReviewSerializer(recent_reviews, many=True).data,
            "today_schedule": ServiceBookingSerializer(today_bookings, many=True).data,
        })

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def analytics(self, request):
        """
        Get historical analytics for provider.
        """
        user = request.user
        if not hasattr(user, 'service_provider_profile'):
             return Response({"error": "User is not a service provider"}, status=403)
        
        provider = user.service_provider_profile
        bookings = ServiceBooking.objects.filter(provider=provider).exclude(status='cancelled').exclude(payment_status='refunded')
        
        from django.utils import timezone
        from django.db.models.functions import TruncMonth
        
        # Last 6 months earnings
        six_months_ago = timezone.now() - timezone.timedelta(days=180)
        
        monthly_stats = bookings.filter(created_at__gte=six_months_ago)\
            .annotate(month=TruncMonth('created_at'))\
            .values('month')\
            .annotate(earnings=Sum('agreed_price'), count=Count('id'))\
            .order_by('month')
            
        # Format for frontend
        data = []
        for entry in monthly_stats:
            data.append({
                "month": entry['month'].strftime('%b %Y'),
                "earnings": entry['earnings'] or 0,
                "bookings": entry['count']
            })
            
        return Response(data)


class ServiceReviewViewSet(viewsets.ModelViewSet):
    queryset = ServiceReview.objects.all().order_by('-created_at')
    serializer_class = ServiceReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ServiceReviewFilter
    search_fields = ['review_text', 'provider__business_name', 'provider__category__name']
    ordering_fields = ['created_at', 'rating_overall']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        # Ensure reviewer is the logged-in user
        if not self.request.user.is_authenticated:
            raise permissions.exceptions.NotAuthenticated()
            
        booking = serializer.validated_data.get('booking')
        provider = serializer.validated_data.get('provider')

        # Logic: If booking is provided, it must be completed and belongs to the user
        if booking:
            if booking.client != self.request.user:
                 raise serializers.ValidationError("You can only review your own bookings.")
            if booking.status != 'completed':
                 raise serializers.ValidationError("You can only review completed bookings.")
            if booking.provider != provider:
                 raise serializers.ValidationError("Booking does not match the provider.")
            if hasattr(booking, 'review'):
                 raise serializers.ValidationError("You have already reviewed this booking.")
            has_booking = True
        else:
            # Fallback/Legacy: If no booking ID, check if they have ANY completed booking for this provider
            has_booking = ServiceBooking.objects.filter(
                provider=provider, 
                client=self.request.user, 
                status='completed'
            ).exists()
            
            # If user wants to force reviews to require a booking ID:
            # raise serializers.ValidationError("A completed booking is required to leave a review.")
        
        # Auto-set category from provider if not passed
        category = serializer.validated_data.get('category')
        if not category and provider.category:
            category = provider.category
             
        review = serializer.save(
            reviewer=self.request.user,
            verified_client=has_booking,
            category=category,
            booking=booking
        )
        
        log_business_event('SERVICE_REVIEW_CREATED', self.request.user, {
            'review_id': review.id,
            'provider_id': review.provider.id,
            'rating': review.rating_overall,
            'verified': has_booking
        })


class ServiceBookingViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'booking_type', 'payment_status']
    ordering_fields = ['start_date', 'created_at']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return ServiceBookingCreateSerializer
        return ServiceBookingSerializer

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return ServiceBooking.objects.none()
        
        # If user is a provider, show bookings for them AND bookings they made as a client
        queryset = ServiceBooking.objects.filter(Q(client=user))
        
        if hasattr(user, 'service_provider_profile'):
            provider_bookings = ServiceBooking.objects.filter(provider=user.service_provider_profile)
            queryset = queryset | provider_bookings
            
        return queryset.select_related('provider', 'pet', 'service_option', 'review').distinct()

    def perform_create(self, serializer):
        # Allow client to create booking
        # Status defaults to pending in model
        instance = serializer.save(client=self.request.user)
        log_business_event('SERVICE_BOOKING_CREATED', self.request.user, {
            'booking_id': instance.id,
            'provider_id': instance.provider.id,
            'pet_id': instance.pet.id
        })

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        booking = self.get_object()
        # Only the provider can accept
        if booking.provider.user != request.user:
            return Response({"error": "Only the service provider can accept this booking."}, status=403)
        
        if booking.status != 'pending':
            return Response({"error": "Can only accept pending bookings."}, status=400)
            
        booking.status = 'confirmed'
        booking.save()
        log_business_event('SERVICE_BOOKING_ACCEPTED', request.user, {
            'booking_id': booking.id,
            'client_id': booking.client.id
        })
        return Response(ServiceBookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        booking = self.get_object()
        # Only the provider can reject
        if booking.provider.user != request.user:
            return Response({"error": "Only the service provider can reject this booking."}, status=403)
            
        booking.status = 'cancelled'
        booking.cancellation_reason = request.data.get('reason', 'Rejected by provider')
        booking.save()
        return Response(ServiceBookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        # Client or Provider can cancel
        if booking.client != request.user and booking.provider.user != request.user:
            return Response({"error": "You do not have permission to cancel this booking."}, status=403)
            
        booking.status = 'cancelled'
        booking.cancellation_reason = request.data.get('reason', 'Cancelled by user')
        booking.save()
        booking.save()
        return Response(ServiceBookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        booking = self.get_object()
        # In a real app, verify payment signature/webhook here.
        # For now, we trust the client (Mock Payment).
        
        booking.payment_status = 'paid'
        booking.save()
        return Response(ServiceBookingSerializer(booking).data)

        return Response(ServiceBookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        booking = self.get_object()
        # Only the provider can start
        if booking.provider.user != request.user:
            return Response({"error": "Only the service provider can start this booking."}, status=403)
        
        if booking.status != 'confirmed':
            return Response({"error": "Can only start confirmed bookings."}, status=400)
            
        booking.status = 'in_progress'
        booking.save()
        log_business_event('SERVICE_BOOKING_STARTED', request.user, {
            'booking_id': booking.id
        })
        return Response(ServiceBookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        booking = self.get_object()
        # Only the provider can complete
        if booking.provider.user != request.user:
            return Response({"error": "Only the service provider can complete this booking."}, status=403)
        
        if booking.status != 'in_progress':
             # Allow completing confirmed ones directly if they forgot to start? 
             # For strictness, let's require start, OR allow 'confirmed' -> 'completed' for instant services.
             # Let's allow 'confirmed' or 'in_progress'
             if booking.status not in ['confirmed', 'in_progress']:
                 return Response({"error": "Can only complete confirmed or in-progress bookings."}, status=400)
        
        # Handle Price and Payment updates
        final_price = request.data.get('final_price')
        if final_price is not None:
            booking.agreed_price = final_price
            
        payment_received = request.data.get('payment_received')
        if payment_received:
            booking.payment_status = 'paid'
            
        booking.status = 'completed'
        booking.save()
        log_business_event('SERVICE_BOOKING_COMPLETED', request.user, {
            'booking_id': booking.id,
            'final_price': str(booking.agreed_price),
            'payment_status': booking.payment_status
        })
        return Response(ServiceBookingSerializer(booking).data)

    @action(detail=True, methods=['post'])
    def reschedule(self, request, pk=None):
        """Allow user to reschedule a pending booking"""
        booking = self.get_object()
        
        # Only the client can reschedule (or provider if permitted, but user asked for pending check)
        if booking.client != request.user:
            return Response({"error": "Only the client can reschedule this booking."}, status=403)
            
        if booking.status != 'pending':
            return Response({"error": "Only pending bookings can be rescheduled."}, status=400)
            
        new_date_str = request.data.get('booking_date')
        new_time_str = request.data.get('booking_time')
        
        if not new_date_str or not new_time_str:
            return Response({"error": "New date and time are required."}, status=400)
            
        try:
            from datetime import datetime, timedelta
            from django.utils import timezone
            
            new_date = datetime.strptime(new_date_str, '%Y-%m-%d').date()
            new_time = datetime.strptime(new_time_str, '%H:%M').time()
            
            # Re-calculate start/end datetime
            new_start_datetime = timezone.make_aware(datetime.combine(new_date, new_time))
            duration = booking.end_datetime - booking.start_datetime
            new_end_datetime = new_start_datetime + duration
            
            # --- Availability Check ---
            # 1. Business Hours
            day_of_week = new_date.weekday()
            try:
                hours = booking.provider.hours.get(day=day_of_week)
                if hours.is_closed:
                    return Response({"error": f"Provider is closed on {new_date_str}"}, status=400)
                    
                if hours.open_time and hours.close_time:
                    if new_time < hours.open_time or new_time > hours.close_time:
                        return Response({"error": "Time is outside business hours."}, status=400)
            except BusinessHours.DoesNotExist:
                pass # Assume 24/7 or default 9-6 if not set
                
            # 2. Conflicts
            conflicts = ServiceBooking.objects.filter(
                provider=booking.provider,
                status__in=['confirmed', 'pending'],
                start_datetime__lt=new_end_datetime,
                end_datetime__gt=new_start_datetime
            ).exclude(id=booking.id).count()
            
            capacity = 1
            if hasattr(booking.provider, 'foster_details'):
                capacity = booking.provider.foster_details.capacity or 1
                
            if conflicts >= capacity:
                return Response({"error": "Slot is no longer available."}, status=400)
                
            # Update booking
            booking.booking_date = new_date
            booking.booking_time = new_time
            booking.start_datetime = new_start_datetime
            booking.end_datetime = new_end_datetime
            booking.save()
            
            log_business_event('SERVICE_BOOKING_RESCHEDULED', request.user, {
                'booking_id': booking.id,
                'new_date': new_date_str,
                'new_time': new_time_str
            })
            
            return Response(ServiceBookingSerializer(booking).data)
            
        except ValueError:
            return Response({"error": "Invalid date or time format."}, status=400)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        """
        Export bookings to CSV
        """
        import csv
        from django.http import HttpResponse

        queryset = self.filter_queryset(self.get_queryset())
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="bookings.csv"'

        writer = csv.writer(response)
        writer.writerow(['Booking ID', 'Service', 'Client', 'Pet', 'Date', 'Time', 'Status', 'Price', 'Payment Status'])

        for booking in queryset:
            writer.writerow([
                booking.id,
                booking.service_option.name if booking.service_option else booking.booking_type,
                booking.client.email,
                booking.pet.name,
                booking.booking_date,
                booking.booking_time,
                booking.status,
                booking.agreed_price,
                booking.payment_status
            ])

        return response

class ProviderDashboardViewSet(viewsets.ViewSet):
    """
    Dedicated ViewSet for Provider Dashboard widgets and analytics.
    Exposed at /api/services/provider/
    """
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='dashboard-stats')
    def dashboard_stats(self, request):
        """
        Aggregated stats for the dashboard overview.
        """
        user = request.user
        if not hasattr(user, 'service_provider_profile'):
             return Response({"error": "User is not a service provider"}, status=403)
        
        provider = user.service_provider_profile
        bookings = ServiceBooking.objects.filter(provider=provider)
        
        from django.utils import timezone
        now = timezone.now()
        thirty_days_ago = now - timezone.timedelta(days=30)
        
        # 1. Booking Counts
        total_bookings = bookings.count()
        pending_bookings = bookings.filter(status='pending').count()
        
        # 2. Earnings (valid bookings only)
        valid_bookings_for_earnings = bookings.filter(status='completed').exclude(payment_status='refunded')
        
        total_earnings = valid_bookings_for_earnings.aggregate(total=Sum('agreed_price'))['total'] or 0
        
        # Monthly Stats
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_earnings = valid_bookings_for_earnings.filter(updated_at__gte=current_month_start).aggregate(total=Sum('agreed_price'))['total'] or 0
        
        # 3. Active Guests (In Progress)
        active_guests = bookings.filter(status='in_progress').count()
        
        # 4. Today's Bookings Count
        todays_bookings_count = bookings.filter(booking_date=now.date()).exclude(status='cancelled').count()
        
        # 5. Recent Activity (Pending requests)
        recent_pending = bookings.filter(status='pending').order_by('created_at')[:5]
        
        from .serializers import ServiceBookingSerializer
        return Response({
            "metrics": {
                "total_earnings": total_earnings,
                "month_earnings": month_earnings,
                "total_bookings": total_bookings,
                "pending_requests": pending_bookings,
                "active_guests": active_guests,
                "todays_bookings": todays_bookings_count
            },
            "recent_pending": ServiceBookingSerializer(recent_pending, many=True).data
        })

    @action(detail=False, methods=['get'], url_path='today')
    def today_schedule(self, request):
        """
        Get all bookings for today, ordered by time.
        """
        user = request.user
        if not hasattr(user, 'service_provider_profile'):
             return Response({"error": "User is not a service provider"}, status=403)
             
        provider = user.service_provider_profile
        from django.utils import timezone
        today = timezone.now().date()
        
        bookings = ServiceBooking.objects.filter(
            provider=provider,
            booking_date=today
        ).exclude(status='cancelled').order_by('booking_time', 'start_datetime')
        
        from .serializers import ServiceBookingSerializer
        return Response(ServiceBookingSerializer(bookings, many=True).data)


