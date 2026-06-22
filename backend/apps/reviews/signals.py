"""
PetCarePlus v2 — Reviews Signals

Auto-update ServiceProvider.avg_rating and total_reviews when reviews are created/deleted.
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg, Count

from apps.reviews.models import Review


def update_provider_rating(provider):
    """Recalculate and update a provider's aggregated rating fields."""
    stats = provider.reviews.aggregate(
        avg=Avg('rating'),
        total=Count('id')
    )
    provider.avg_rating = stats['avg'] or 0
    provider.total_reviews = stats['total'] or 0
    provider.save(update_fields=['avg_rating', 'total_reviews'])


@receiver(post_save, sender=Review)
def on_review_saved(sender, instance, **kwargs):
    update_provider_rating(instance.provider)


@receiver(post_delete, sender=Review)
def on_review_deleted(sender, instance, **kwargs):
    update_provider_rating(instance.provider)
