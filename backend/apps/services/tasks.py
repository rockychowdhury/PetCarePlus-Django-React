from django.core.exceptions import ObjectDoesNotExist
import logging
from .models import ServiceBooking
from .utils import send_booking_confirmation_email, send_booking_status_update_email

logger = logging.getLogger(__name__)

def send_booking_confirmation_email_task(booking_id):
    """
    Async task to send booking confirmation email.
    """
    try:
        booking = ServiceBooking.objects.get(id=booking_id)
        send_booking_confirmation_email(booking)
        logger.info(f"Confirmation email sent for booking {booking_id}")
    except ServiceBooking.DoesNotExist:
        logger.error(f"Booking {booking_id} not found for confirmation email")
    except Exception as e:
        logger.error(f"Failed to send confirmation email for booking {booking_id}: {str(e)}")

def send_booking_status_update_email_task(booking_id):
    """
    Async task to send booking status update email.
    """
    try:
        booking = ServiceBooking.objects.get(id=booking_id)
        send_booking_status_update_email(booking)
        logger.info(f"Status update email sent for booking {booking_id} (Status: {booking.status})")
    except ServiceBooking.DoesNotExist:
        logger.error(f"Booking {booking_id} not found for status update email")
    except Exception as e:
        logger.error(f"Failed to send status update email for booking {booking_id}: {str(e)}")
