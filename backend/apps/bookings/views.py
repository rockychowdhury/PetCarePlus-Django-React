"""
PetCarePlus v2 — Bookings Views

API Views for creating, listing, and managing Booking appointments.
Enforces role-based permissions: customers can book and cancel,
while providers can confirm, complete, and cancel.
"""

from rest_framework import viewsets, permissions, filters, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from django_filters.rest_framework import DjangoFilterBackend

from apps.bookings.models import Booking
from apps.bookings.serializers import BookingSerializer


class BookingViewSet(viewsets.ModelViewSet):
    """
    ViewSet for booking management.
    Listings are scoped to the active authenticated user role.
    """
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'booking_date', 'provider']
    ordering_fields = ['booking_date', 'created_at']
    ordering = ['-booking_date', '-created_at']

    def get_queryset(self):
        user = self.request.user
        
        base_qs = Booking.objects.select_related(
            'user', 'provider__user', 'service', 'animal_type', 'review'
        ).prefetch_related(
            'provider__services', 'provider__animal_types__animal_type'
        )
        
        # Admin can access all appointments
        if user.role == 'admin':
            return base_qs.all()
            
        # Providers view appointments booked with them
        if user.role == 'provider':
            # Check if user has a ServiceProvider profile
            if hasattr(user, 'service_provider'):
                return base_qs.filter(provider=user.service_provider)
            return Booking.objects.none()

        # Regular customers (pet owners/farmers) view their own appointments
        return base_qs.filter(user=user)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'provider':
            raise PermissionDenied("Service providers cannot book appointments with themselves or other providers.")
            
        # Create as pending
        serializer.save(user=user, status=Booking.Status.PENDING)

    def perform_update(self, serializer):
        instance = self.get_object()
        user = self.request.user
        new_status = self.request.data.get('status')

        if new_status and new_status != instance.status:
            # Enforce transition permissions
            if user.role == 'admin':
                pass
            elif user == instance.user:
                # Customer can only cancel appointments
                if new_status != Booking.Status.CANCELLED:
                    raise PermissionDenied("As a customer, you can only cancel appointments.")
            elif hasattr(user, 'service_provider') and instance.provider == user.service_provider:
                # Provider can confirm, complete, or cancel appointments
                if new_status not in [Booking.Status.CONFIRMED, Booking.Status.COMPLETED, Booking.Status.CANCELLED]:
                    raise PermissionDenied(
                        "As a provider, you can only set bookings to Confirmed, Completed, or Cancelled."
                    )
            else:
                raise PermissionDenied("You do not have permission to modify this booking.")
            
            serializer.save(status=new_status)
        else:
            serializer.save()
