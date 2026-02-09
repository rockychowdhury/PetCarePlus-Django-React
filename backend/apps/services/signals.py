from django.db.models.signals import post_save, pre_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
import logging
from .models import ServiceBooking, ServiceProvider, ServiceCategory, ServiceReview
from django_q.tasks import async_task


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
        async_task('apps.services.tasks.send_booking_confirmation_email_task', instance.id)
    else:
        if instance.status in ['confirmed', 'rejected', 'cancelled', 'in_progress', 'completed']:
             async_task('apps.services.tasks.send_booking_status_update_email_task', instance.id)

# Note: In a production app, checking `if instance.tracker.has_changed('status')` (django-model-utils) is recommended.






