"""
PetCarePlus v2 — Notifications Model

Simple typed notification system. No GenericFK complexity from v1.
"""

from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    In-app notification for bookings, applications, reviews, and system messages.
    """

    class NotificationType(models.TextChoices):
        BOOKING = 'booking', 'Booking'
        APPLICATION = 'application', 'Rehoming Application'
        REVIEW = 'review', 'Review'
        SYSTEM = 'system', 'System'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )

    notification_type = models.CharField(
        max_length=15,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM
    )

    # Bilingual content
    title_en = models.CharField(max_length=200)
    title_bn = models.CharField(max_length=200, blank=True)
    message_en = models.TextField(blank=True)
    message_bn = models.TextField(blank=True)

    # Navigation
    link = models.CharField(
        max_length=500,
        blank=True,
        help_text='Frontend route to navigate to (e.g., /bookings/123)'
    )

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        status = '✓' if self.is_read else '○'
        return f'{status} {self.title_en} → {self.user.email}'
