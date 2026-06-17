"""
PetCarePlus v2 — Bookings Model

Simplified booking system for scheduling appointments with service providers.
Removed v1 complexity: guest fields, payment fields, recurring/emergency types.
"""

from django.db import models
from django.conf import settings


class Booking(models.Model):
    """
    Appointment record linking a user, provider, service, and optionally a pet.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONFIRMED = 'confirmed', 'Confirmed'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    provider = models.ForeignKey(
        'providers.ServiceProvider',
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    service = models.ForeignKey(
        'providers.ProviderService',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )
    pet = models.ForeignKey(
        'pets.Pet',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='bookings'
    )

    booking_date = models.DateField()
    booking_time = models.TimeField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.PENDING
    )
    notes = models.TextField(blank=True, help_text='Special requirements or notes')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Booking'
        verbose_name_plural = 'Bookings'
        ordering = ['-booking_date', '-created_at']
        indexes = [
            models.Index(fields=['provider', 'status']),
            models.Index(fields=['user', 'status']),
            models.Index(fields=['booking_date']),
        ]

    def __str__(self):
        return f'Booking: {self.user.email} → {self.provider.business_name} on {self.booking_date}'
