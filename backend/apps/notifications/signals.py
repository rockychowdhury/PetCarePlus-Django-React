"""
PetCarePlus v2 — Notification Signals

Auto-creates beautiful, fully translated bilingual notifications on key events:
- Booking creation and status updates (notifies provider/customer)
- Adoption application creation and updates (notifies listing owner/applicant)
- Review submissions (notifies provider)
"""

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.bookings.models import Booking
from apps.rehoming.models import RehomingApplication
from apps.reviews.models import Review
from apps.notifications.models import Notification

STATUS_MAP_BN = {
    'pending': 'অপেক্ষমান',
    'confirmed': 'নিশ্চিত',
    'completed': 'সম্পন্ন',
    'cancelled': 'বাতিল',
    'approved': 'অনুমোদিত',
    'rejected': 'প্রত্যাখ্যাত',
}


@receiver(post_save, sender=Booking)
def on_booking_saved(sender, instance, created, **kwargs):
    """Triggers notifications for providers on booking create, and for customers on updates."""
    if created:
        # Notify provider
        Notification.objects.create(
            user=instance.provider.user,
            notification_type=Notification.NotificationType.BOOKING,
            title_en="New Appointment Booking",
            title_bn="নতুন অ্যাপয়েন্টমেন্ট বুকিং",
            message_en=f"You have received a new booking from {instance.user.full_name} on {instance.booking_date}.",
            message_bn=f"আপনি {instance.booking_date} তারিখে {instance.user.full_name} এর কাছ থেকে একটি নতুন বুকিং পেয়েছেন।",
            link=f"/bookings/"
        )
    else:
        # Notify customer on status update
        status_bn = STATUS_MAP_BN.get(instance.status, instance.status)
        Notification.objects.create(
            user=instance.user,
            notification_type=Notification.NotificationType.BOOKING,
            title_en=f"Appointment {instance.status.capitalize()}",
            title_bn=f"অ্যাপয়েন্টমেন্ট {status_bn}",
            message_en=f"Your appointment with {instance.provider.business_name} has been {instance.status}.",
            message_bn=f"{instance.provider.business_name} এর সাথে আপনার অ্যাপয়েন্টমেন্টটি {status_bn} করা হয়েছে।",
            link=f"/bookings/"
        )


@receiver(post_save, sender=RehomingApplication)
def on_application_saved(sender, instance, created, **kwargs):
    """Triggers notifications for listing owners on new applications, and for applicants on updates."""
    if created:
        # Notify listing owner
        Notification.objects.create(
            user=instance.listing.owner,
            notification_type=Notification.NotificationType.APPLICATION,
            title_en="New Adoption Application",
            title_bn="নতুন দত্তক নেওয়ার আবেদন",
            message_en=f"You have received a new adoption application for {instance.listing.pet_name}.",
            message_bn=f"আপনি {instance.listing.pet_name} এর জন্য একটি নতুন দত্তক নেওয়ার আবেদন পেয়েছেন।",
            link=f"/rehoming/"
        )
    else:
        # Notify applicant
        status_bn = STATUS_MAP_BN.get(instance.status, instance.status)
        Notification.objects.create(
            user=instance.applicant,
            notification_type=Notification.NotificationType.APPLICATION,
            title_en=f"Adoption Application {instance.status.capitalize()}",
            title_bn=f"দত্তক নেওয়ার আবেদন {status_bn}",
            message_en=f"Your adoption application for {instance.listing.pet_name} has been {instance.status}.",
            message_bn=f"{instance.listing.pet_name} এর জন্য আপনার দত্তক নেওয়ার আবেদনটি {status_bn} করা হয়েছে।",
            link=f"/rehoming/"
        )


@receiver(post_save, sender=Review)
def on_review_saved(sender, instance, created, **kwargs):
    """Triggers notifications for providers on receiving new reviews."""
    if created:
        Notification.objects.create(
            user=instance.provider.user,
            notification_type=Notification.NotificationType.REVIEW,
            title_en="New Review Received",
            title_bn="নতুন রিভিউ পাওয়া গেছে",
            message_en=f"You received a new {instance.rating}★ review from {instance.reviewer.full_name}.",
            message_bn=f"আপনি {instance.reviewer.full_name} এর কাছ থেকে একটি নতুন {instance.rating}★ রিভিউ পেয়েছেন।",
            link=f"/providers/{instance.provider.id}/"
        )
