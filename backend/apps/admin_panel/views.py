from rest_framework import viewsets, permissions, status, filters
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import UserReport
from .serializers import UserReportSerializer
from apps.users.permissions import IsAdmin
from apps.services.models import ServiceProvider
from apps.services.serializers import ServiceProviderSerializer
from apps.users.serializers import UserSerializer

class UserReportViewSet(viewsets.ModelViewSet):
    """
    Admin only viewset for managing user reports.
    Users can create reports, but only admins can list/update them.
    """
    queryset = UserReport.objects.all().order_by('-created_at')
    serializer_class = UserReportSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated()]
        return [permissions.IsAuthenticated(), IsAdmin()]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    @action(detail=True, methods=['patch'])
    def resolve(self, request, pk=None):
        report = self.get_object()
        status_val = request.data.get('status')
        notes = request.data.get('admin_notes', '')
        
        if status_val not in dict(UserReport.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
            
        report.status = status_val
        report.admin_notes = notes
        if status_val in ['action_taken', 'dismissed']:
             report.resolved_at = timezone.now()
        report.save()
        return Response({'status': 'updated'})


class ListingModerationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Admin view for managing pending listings.
    Allows approving/rejecting listings.
    """
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    
    def get_serializer_class(self):
        from rest_framework import serializers
        from apps.rehoming.models import RehomingListing
        class SimpleListingSerializer(serializers.ModelSerializer):
            class Meta:
                model = RehomingListing
                fields = '__all__'
        return SimpleListingSerializer

    def get_queryset(self):
        from apps.rehoming.models import RehomingListing
        status_param = self.request.query_params.get('status')
        if status_param:
             return RehomingListing.objects.filter(status=status_param).order_by('-created_at')
        # Listings that need attention? RehomingListing doesn't have pending_review status in new model plan?
        # Checking plan... RehomingListing status choices: draft, active, paused, closed.
        # Maybe "draft" -> "active"? Or we add a "review"?
        # For now, let's just return all non-drafts or just active?
        # Refactor suggestion implies simplified peer-to-peer, so moderation might be post-hoc.
        return RehomingListing.objects.exclude(status='draft').order_by('-created_at')

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        listing = self.get_object()
        listing.status = 'active'
        listing.published_at = timezone.now()
        listing.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        listing = self.get_object()
        listing.status = 'closed' # Or we add rejected status?
        listing.save()
        return Response({'status': 'rejected'})


from rest_framework.views import APIView

class AnalyticsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        from django.contrib.auth import get_user_model
        from apps.rehoming.models import RehomingListing, RehomingRequest, AdoptionInquiry
        from apps.services.models import ServiceBooking, ServiceProvider
        from apps.users.models import RoleRequest
        from django.db.models import Count, Sum
        from django.db.models.functions import TruncMonth
        
        User = get_user_model()
        today = timezone.now().date()
        
        # 1. KPI Cards
        total_users = User.objects.count()
        new_users_today = User.objects.filter(date_joined__date=today).count()
        active_listings = RehomingListing.objects.filter(status='active').count()
        total_bookings = ServiceBooking.objects.count()
        total_revenue = ServiceBooking.objects.filter(payment_status='paid').aggregate(total=Sum('agreed_price'))['total'] or 0

        # 2. Charts: User Growth (Last 6 Months)
        six_months_ago = timezone.now() - timezone.timedelta(days=180)
        user_growth = User.objects.filter(date_joined__gte=six_months_ago)\
            .annotate(month=TruncMonth('date_joined'))\
            .values('month')\
            .annotate(count=Count('id'))\
            .order_by('month')
            
        user_growth_data = [
            {'name': item['month'].strftime('%b %Y'), 'users': item['count']}
            for item in user_growth
        ]

        # 3. Charts: Booking Volume & Revenue (Last 6 Months)
        booking_trends = ServiceBooking.objects.filter(created_at__gte=six_months_ago)\
            .annotate(month=TruncMonth('created_at'))\
            .values('month')\
            .annotate(count=Count('id'), revenue=Sum('agreed_price'))\
            .order_by('month')

        revenue_data = [
            {'name': item['month'].strftime('%b %Y'), 'revenue': item['revenue'] or 0, 'bookings': item['count']}
            for item in booking_trends
        ]
        
        # 4. Charts: Booking Status Distribution
        status_dist = ServiceBooking.objects.values('status').annotate(count=Count('id'))
        # Mapping status to cleaner labels/colors ideally happens on frontend, but data structure:
        status_data = [{'name': item['status'], 'value': item['count']} for item in status_dist]

        # 5. Pending Counts (Action Center)
        pending_role_requests = RoleRequest.objects.filter(status='pending').count()
        pending_providers = ServiceProvider.objects.filter(verification_status='pending').count()
        # Listings: 'pending_review' is the status for listings needing approval
        pending_listings = RehomingListing.objects.filter(status='pending_review').count()
        # Applications (Inquiries):
        total_applications = AdoptionInquiry.objects.count()

        # 6. Recent Activity Stream
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_bookings = ServiceBooking.objects.order_by('-created_at')[:5]
        recent_providers = ServiceProvider.objects.order_by('-created_at')[:5]
        recent_roles = RoleRequest.objects.order_by('-created_at')[:5]

        activity_stream = []
        for u in recent_users:
            activity_stream.append({
                'type': 'user',
                'message': f"New user joined: {u.first_name} {u.last_name}",
                'time': u.date_joined,
                'id': f"u_{u.id}"
            })
        
        for b in recent_bookings:
            service_name = b.service_option.name if b.service_option else "Service"
            pet_name = b.pet.name if b.pet else "Unknown Pet"
            activity_stream.append({
                'type': 'booking',
                'message': f"New booking: {service_name} for {pet_name}",
                'time': b.created_at,
                'id': f"b_{b.id}"
            })

        for p in recent_providers:
            activity_stream.append({
                'type': 'provider',
                'message': f"New provider registration: {p.business_name}",
                'time': p.created_at,
                'id': f"p_{p.id}"
            })

        for r in recent_roles:
            activity_stream.append({
                'type': 'role',
                'message': f"New {r.requested_role} request by {r.user.first_name}",
                'time': r.created_at,
                'id': f"r_{r.id}"
            })
        
        # Sort combined list by time descending and take top 10
        activity_stream.sort(key=lambda x: x['time'], reverse=True)
        recent_activity = activity_stream[:10]

        data = {
            'kpi': {
                'total_users': total_users,
                'new_users_today': new_users_today,
                'active_listings': active_listings,
                'total_bookings': total_bookings,
                'total_revenue': total_revenue,
                'total_applications': total_applications,
            },
            'pending_counts': {
                'role_requests': pending_role_requests,
                'providers': pending_providers,
                'listings': pending_listings,
            },
            'recent_activity': recent_activity,
            'charts': {
                'user_growth': user_growth_data,
                'revenue_trends': revenue_data,
                'status_distribution': status_data,
            }
        }
        return Response(data)

class ModerationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only view for audit logs of moderation actions.
    """
    from .models import ModerationAction
    from .serializers import ModerationActionSerializer
    
    queryset = ModerationAction.objects.all().order_by('-created_at')
    serializer_class = ModerationActionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['moderator__email', 'target_user__email', 'reason']
    filterset_fields = ['action_type']

from .models import UserReport
from .serializers import UserReportListSerializer, UserReportDetailSerializer

class UserReportViewSet(viewsets.ModelViewSet):
    """
    Admin ViewSet for managing User Reports.
    """
    queryset = UserReport.objects.all().order_by('-created_at')
    # Default to list serializer
    serializer_class = UserReportListSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['status', 'report_type', 'severity']
    search_fields = ['description', 'reporter__email', 'reported_user__email']
    ordering_fields = ['created_at', 'severity']

    def get_serializer_class(self):
        if self.action in ['retrieve', 'update', 'partial_update']:
            return UserReportDetailSerializer
        return UserReportListSerializer

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        report = self.get_object()
        report.status = 'action_taken'
        report.resolved_at = timezone.now()
        report.action_taken = request.data.get('action_taken', 'Resolved by admin')
        report.admin_notes = request.data.get('admin_notes', '')
        report.save()
        return Response({'status': 'action_taken'})

    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        report = self.get_object()
        report.status = 'dismissed'
        report.resolved_at = timezone.now()
        report.admin_notes = request.data.get('admin_notes', 'Dismissed by admin')
        report.save()
        return Response({'status': 'dismissed'})

class RoleRequestViewSet(viewsets.ModelViewSet):
    """
    Admin only viewset for managing role requests.
    Supports approving and rejecting requests with atomic updates.
    """
    from apps.users.models import RoleRequest
    from .serializers import RoleRequestSerializer
    
    queryset = RoleRequest.objects.all().order_by('-created_at')
    serializer_class = RoleRequestSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['status', 'requested_role']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    
    def get_queryset(self):
        # Admins see all
        return self.queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        role_request = self.get_object()
        
        if role_request.status != 'pending':
             return Response({"error": "Request is not pending"}, status=400)
             
        # Approve
        from django.db import transaction
        from apps.common.logging_utils import log_business_event
        
        with transaction.atomic():
            # 1. Update Request
            role_request.status = 'approved'
            role_request.admin_notes = request.data.get('admin_notes', '')
            role_request.save()
            
            # 2. Update User Role
            user = role_request.user
            user.role = role_request.requested_role
            if not user.is_active: # Ensure active if promoting
                user.is_active = True
            user.save()
            
            # 3. Update Service Provider Profile (if applicable)
            if hasattr(user, 'service_provider_profile'):
                provider = user.service_provider_profile
                provider.verification_status = 'verified'
                provider.application_status = 'approved'
                provider.save()
                
            log_business_event('ROLE_REQUEST_APPROVED', request.user, {
                'request_id': role_request.id,
                'target_user_id': user.id,
                'role': role_request.requested_role
            })
            
        return Response({'status': 'approved'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def reject(self, request, pk=None):
        """Reject a role request"""
        role_request = self.get_object()
        
        if role_request.status != 'pending':
            return Response(
                {"error": "Only pending requests can be rejected"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            role_request.status = 'rejected'
            role_request.admin_notes = request.data.get('admin_notes', '')
            role_request.save()
            
            # Update Provider Application Status
            user = role_request.user
            if hasattr(user, 'service_provider_profile'):
                provider = user.service_provider_profile
                provider.application_status = 'rejected'
                provider.save()
        
        return Response({'status': 'rejected'})


from django.contrib.auth import get_user_model
from apps.users.serializers import UserSerializer, AdminUserDetailSerializer

User = get_user_model()

class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Admin-only ViewSet for managing all users in the system.
    Supports advanced filtering, searching, and status updates.
    """
    queryset = User.objects.all().order_by('-date_joined')
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active', 'email_verified', 'phone_verified']
    search_fields = ['email', 'first_name', 'last_name', 'phone_number']
    ordering_fields = ['date_joined', 'last_login', 'email']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AdminUserDetailSerializer
        if self.action == 'list':
            from .serializers import AdminUserListSerializer
            return AdminUserListSerializer
        if self.action in ['update', 'partial_update']:
            from .serializers import AdminUserUpdateSerializer
            return AdminUserUpdateSerializer
        return UserSerializer

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle user's active status (ban/unban)"""
        user = self.get_object()
        user.is_active = not user.is_active
        user.save()
        status_str = "activated" if user.is_active else "deactivated/banned"
        return Response({'status': status_str, 'is_active': user.is_active})

    @action(detail=True, methods=['post'])
    def verify_email(self, request, pk=None):
        """Manually verify a user's email"""
        user = self.get_object()
        user.email_verified = True
        user.save()
        return Response({'status': 'email verified'})


class AdminPetViewSet(viewsets.ModelViewSet):
    """
    Admin-only ViewSet for managing all pet listings.
    """
    from apps.pets.models import PetProfile
    from apps.pets.serializers import PetProfileSerializer # Using standard serializer for now, can create Admin one if needed
    
    queryset = PetProfile.objects.all().order_by('-created_at')
    serializer_class = PetProfileSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filter fields
    filterset_fields = ['species', 'status', 'gender', 'size_category', 'spayed_neutered', 'microchipped']
    
    # Search fields
    search_fields = ['name', 'breed', 'owner__email', 'owner__first_name', 'owner__last_name']
    
    # Ordering fields
    ordering_fields = ['created_at', 'name', 'birth_date', 'updated_at']

    def perform_create(self, serializer):
        # Admins can create pets for users? Maybe not needed, but standard ModelViewSet allows it.
        # If so, we'd need to handle 'owner'... standard serializer might assume request.user.
        # For now, let's assume this is mostly for viewing/editing/deleting.
        serializer.save(owner=self.request.user) # Fallback


class AdminBookingViewSet(viewsets.ModelViewSet):
    """
    Admin-only ViewSet for managing all service bookings.
    """
    from apps.services.models import ServiceBooking
    from apps.services.serializers import ServiceBookingSerializer
    
    queryset = ServiceBooking.objects.all().order_by('-created_at')
    serializer_class = ServiceBookingSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    # Filter fields
    filterset_fields = ['status', 'payment_status', 'booking_type']
    
    # Search fields (Client email/name, Provider business name)
    search_fields = [
        'client__email', 'client__first_name', 'client__last_name',
        'provider__business_name', 'provider__user__email',
        'service_option__name'
    ]
    
    # Ordering fields
    ordering_fields = ['created_at', 'booking_date', 'agreed_price']

    def get_queryset(self):
        # Optimize queries
        return self.queryset.select_related(
            'client', 'provider', 'service_option'
        )

class AdminProviderViewSet(viewsets.ModelViewSet):
    """
    Admin-only ViewSet for managing service providers.
    Exposes full user details including email.
    """


    class AdminServiceProviderSerializer(ServiceProviderSerializer):
        user = UserSerializer(read_only=True)
        # We can also expose other hidden fields if needed
        class Meta(ServiceProviderSerializer.Meta):
            model = ServiceProvider
            fields = ServiceProviderSerializer.Meta.fields
            read_only_fields = ServiceProviderSerializer.Meta.read_only_fields

    queryset = ServiceProvider.objects.all().order_by('-created_at')
    serializer_class = AdminServiceProviderSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['verification_status', 'category__slug']
    search_fields = ['business_name', 'user__email', 'user__first_name', 'user__last_name', 'city']
    ordering_fields = ['created_at', 'business_name', 'verification_status']

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        provider = self.get_object()
        status_val = request.data.get('status')
        if status_val not in ['pending', 'verified', 'rejected']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        provider.verification_status = status_val
        provider.save()
        return Response({'status': status_val})
