"""
PetCarePlus v2 — Reviews Serializers

Serializer for submitting and reading reviews.
Validates booking completion status, ownership, and uniqueness.
"""

from rest_framework import serializers
from apps.reviews.models import Review
from apps.bookings.models import Booking


class ReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for the Review model.
    Enforces rigorous API validation constraints on booking status and ownership.
    """
    reviewer_name = serializers.CharField(source='reviewer.full_name', read_only=True)
    reviewer_email = serializers.EmailField(source='reviewer.email', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'booking', 'reviewer', 'reviewer_name', 'reviewer_email',
            'provider', 'rating', 'comment', 'created_at'
        ]
        read_only_fields = ['id', 'reviewer', 'provider', 'created_at']

    def validate(self, attrs):
        booking = attrs.get('booking')
        request = self.context.get('request')

        if not request or not request.user:
            raise serializers.ValidationError("Authentication is required to leave a review.")

        # 1. Authorisation check: must be the customer who booked the service
        if booking.user != request.user:
            raise serializers.ValidationError(
                {'booking': "You do not have permission to review this booking."}
            )

        # 2. Appointment status validation: must be 'completed'
        if booking.status != Booking.Status.COMPLETED:
            raise serializers.ValidationError(
                {'booking': "Reviews can only be submitted for completed appointments."}
            )

        # 3. Duplicate check — use database query for reliability
        if Review.objects.filter(booking=booking).exists():
            raise serializers.ValidationError(
                {'booking': "A review has already been submitted for this appointment."}
            )

        return attrs
