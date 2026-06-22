"""
PetCarePlus v2 — Reviews Model

One review per completed booking. Single overall rating (1-5) + bilingual comment.
Provider avg_rating and total_reviews are updated via signal.
"""

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Review(models.Model):
    """
    Review for a completed booking.
    Simplified from v1's 5-category rating system to a single rating + comment.
    """

    booking = models.OneToOneField(
        'bookings.Booking',
        on_delete=models.CASCADE,
        related_name='review'
    )
    reviewer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='reviews_given'
    )
    provider = models.ForeignKey(
        'providers.ServiceProvider',
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    rating = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        help_text='Rating from 1 to 5 stars'
    )
    comment = models.TextField(blank=True, help_text='Review text (Bangla or English)')

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Review'
        verbose_name_plural = 'Reviews'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.rating}★ for {self.provider.business_name} by {self.reviewer.email}'
