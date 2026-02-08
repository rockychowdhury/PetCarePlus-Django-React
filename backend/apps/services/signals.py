from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
import logging
from .models import ServiceBooking, ServiceProvider, ServiceCategory, ServiceReview
from .tasks import send_booking_confirmation_email_task, send_booking_status_update_email_task

logger = logging.getLogger(__name__)

@receiver(post_save, sender=ServiceBooking)
def booking_notification(sender, instance, created, **kwargs):
    """
    Trigger emails on booking creation and status updates.
    """
    if created:
        # Send initial confirmation (Request Sent)
        # Using on_commit is safer if using transactions, but .delay() usually suffices for simple setups.
        # If atomic blocks are used heavily, consider transaction.on_commit(lambda: task.delay(...))
        send_booking_confirmation_email_task.delay(instance.id)
    else:
        if instance.status in ['confirmed', 'rejected', 'cancelled', 'in_progress', 'completed']:
             send_booking_status_update_email_task.delay(instance.id)

# Note: In a production app, checking `if instance.tracker.has_changed('status')` (django-model-utils) is recommended.


# Cache Invalidation Signals

@receiver([post_save, post_delete], sender=ServiceProvider)
def invalidate_provider_cache(sender, instance, **kwargs):
    """Invalidate provider cache when a provider is created, updated, or deleted."""
    try:
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern('*ServiceProviderViewSet*')
            logger.info(f'Invalidated provider cache for provider {instance.id}')
        else:
            cache.clear()
            logger.info(f'Cleared all cache (provider {instance.id} changed)')
    except Exception as e:
        logger.error(f'Error invalidating provider cache: {e}')


@receiver([post_save, post_delete], sender=ServiceCategory)
def invalidate_category_cache(sender, instance, **kwargs):
    """Invalidate category cache when a category is created, updated, or deleted."""
    try:
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern('*ServiceCategoryViewSet*')
            cache.delete_pattern('*ServiceProviderViewSet*')  # Providers include category
            logger.info(f'Invalidated category cache for category {instance.id}')
        else:
            cache.clear()
            logger.info(f'Cleared all cache (category {instance.id} changed)')
    except Exception as e:
        logger.error(f'Error invalidating category cache: {e}')


@receiver([post_save, post_delete], sender=ServiceReview)
def invalidate_review_cache(sender, instance, **kwargs):
    """Invalidate provider cache when a review is added/updated/deleted."""
    try:
        if hasattr(cache, 'delete_pattern'):
            cache.delete_pattern('*ServiceProviderViewSet*')  # Reviews affect ratings
            logger.info(f'Invalidated cache due to review change for provider {instance.provider_id}')
        else:
            cache.clear()
            logger.info(f'Cleared all cache (review for provider {instance.provider_id} changed)')
    except Exception as e:
        logger.error(f'Error invalidating review cache: {e}')

