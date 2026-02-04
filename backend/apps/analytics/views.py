from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from apps.services.models import ServiceBooking
from apps.services.serializers import ServiceBookingSerializer
from apps.rehoming.models import RehomingListing, AdoptionInquiry
from apps.rehoming.serializers import ListingSerializer, AdoptionInquirySerializer
from apps.pets.models import PetProfile

class UserDashboardOverviewView(APIView):
    """
    Unified view to provide all necessary data for the user dashboard overview.
    Prioritizes Service features, followed by Rehoming features.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()

        # 1. SERVICE DATA (Primary focus)
        # Get next upcoming booking
        next_visit = ServiceBooking.objects.filter(
            client=user,
            status__in=['confirmed', 'in_progress'],
            start_datetime__gte=now
        ).order_by('start_datetime').first()
        
        # Service engagement stats
        total_bookings = ServiceBooking.objects.filter(client=user).count()
        pending_reviews = ServiceBooking.objects.filter(
            client=user,
            status='completed',
            review__isnull=True
        ).count()
        
        recent_bookings = ServiceBooking.objects.filter(
            client=user
        ).order_by('-created_at')[:3]

        # 2. REHOMING DATA (Secondary focus)
        my_pets_count = PetProfile.objects.filter(owner=user).count()
        active_listings_count = RehomingListing.objects.filter(owner=user, status='active').count()
        apps_received_count = AdoptionInquiry.objects.filter(listing__owner=user).count()
        apps_submitted_count = AdoptionInquiry.objects.filter(requester=user).count()
        
        recent_inquiries_received = AdoptionInquiry.objects.filter(
            listing__owner=user
        ).order_by('-created_at')[:3]
        
        recent_inquiries_sent = AdoptionInquiry.objects.filter(
            requester=user
        ).order_by('-created_at')[:3]
        return Response({
            'user': {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_service_provider': user.is_service_provider,
                'provider_status': getattr(user, 'service_provider_profile', None).application_status if hasattr(user, 'service_provider_profile') else None,
            },
            'services': {
                'next_visit': ServiceBookingSerializer(next_visit).data if next_visit else None,
                'stats': {
                    'total_bookings': total_bookings,
                    'pending_reviews': pending_reviews,
                    'upcoming_bookings_count': ServiceBooking.objects.filter(
                        client=user,
                        status='confirmed',
                        start_datetime__gte=now
                    ).count(),
                },
                'recent_bookings': ServiceBookingSerializer(recent_bookings, many=True).data
            },
            'rehoming': {
                'stats': {
                    'my_pets_count': my_pets_count,
                    'active_listings_count': active_listings_count,
                    'apps_received_count': apps_received_count,
                    'apps_submitted_count': apps_submitted_count,
                },
                'recent_inquiries_received': AdoptionInquirySerializer(recent_inquiries_received, many=True).data,
                'recent_inquiries_sent': AdoptionInquirySerializer(recent_inquiries_sent, many=True).data,
            },
            'server_time': now
        })
