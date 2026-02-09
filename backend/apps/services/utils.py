from django.core.mail import send_mail
from django.conf import settings
from apps.users.utils.email import get_email_template

def send_booking_confirmation_email(booking):
    """
    Send confirmation email to the user when they request a booking.
    """
    service_name = booking.service_option.name if booking.service_option else booking.get_booking_type_display()
    
    # --- Client Email ---
    subject = f'Booking Request Sent - {service_name}'
    title = f"Booking Request Sent"
    
    details_html = f"""
        <div style="text-align: left; margin: 20px 0; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
            <p><strong>Service:</strong> {service_name}</p>
            <p><strong>Provider:</strong> {booking.provider.business_name}</p>
            <p><strong>Date:</strong> {booking.booking_date}</p>
            <p><strong>Time:</strong> {booking.booking_time or 'N/A'}</p>
            <p><strong>Pet:</strong> {booking.pet.name} ({booking.pet.get_species_display()})</p>
        </div>
    """

    content_html = f"""
        <p class="text">Hi {booking.client.first_name},</p>
        <p class="text">Your booking request has been sent successfully. The provider will review it shortly.</p>
        {details_html}
        <p class="text">You will receive another email when the provider accepts your request.</p>
    """
    
    footer_text = "You can view your bookings in your dashboard."
    html_message = get_email_template(title, content_html, footer_text)
    
    send_mail(
        subject,
        f"Your booking request for {service_name} has been sent.", # Plain text fallback
        settings.DEFAULT_FROM_EMAIL,
        [booking.client.email],
        html_message=html_message,
        fail_silently=True,
    )
    
    # --- Provider Email ---
    provider_subject = f'New Booking Request - {service_name}'
    provider_title = "New Booking Request"
    
    provider_content = f"""
        <p class="text">Hi {booking.provider.user.first_name},</p>
        <p class="text">You have a new booking request from {booking.client.first_name} {booking.client.last_name}.</p>
        {details_html}
        <p class="text">Please log in to your dashboard to Accept or Reject this request.</p>
        <a href="{settings.FRONTEND_URL}/provider/bookings" class="link-btn">Manage Bookings</a>
    """
    
    provider_html = get_email_template(provider_title, provider_content, "Please respond within 24 hours.")
    
    send_mail(
        provider_subject,
        f"New booking request from {booking.client.first_name}.", 
        settings.DEFAULT_FROM_EMAIL,
        [booking.provider.email],
        html_message=provider_html,
        fail_silently=True,
    )

def send_booking_status_update_email(booking):
    """
    Send email to user when booking status changes.
    """
    status = booking.status
    service_name = booking.service_option.name if booking.service_option else booking.get_booking_type_display()
    
    action_text = {
        'confirmed': 'Confirmed',
        'rejected': 'Declined',
        'cancelled': 'Cancelled',
        'in_progress': 'Started',
        'completed': 'Completed'
    }.get(status, status.title())
    
    subject = f'Booking Update: {action_text} - {service_name}'
    title = f"Booking {action_text}"
    
    color = "#2da44e" # Green
    if status in ['rejected', 'cancelled']:
        color = "#cf222e" # Red
    elif status == 'in_progress':
        color = "#d29922" # Yellow/Orange
    elif status == 'completed':
        color = "#0969da" # Blue
        
    status_badge = f"""
        <div style="background-color: {color}; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; margin: 16px 0;">
            {action_text}
        </div>
    """
    
    message_body = ""
    if status == 'confirmed':
        message_body = "Your booking has been confirmed! We look forward to seeing you."
    elif status == 'rejected':
        message_body = "We apologize, but the provider cannot accept this booking request at this time."
    elif status == 'cancelled':
        message_body = "The booking has been cancelled."
    elif status == 'in_progress':
        message_body = f"The service '{service_name}' has started!"
    elif status == 'completed':
        message_body = "The service has been completed. We hope you and your pet verify happy!"

    details_html = f"""
        <div style="text-align: left; margin: 20px 0; padding: 15px; border: 1px solid #eee; border-radius: 8px;">
            <p><strong>Service:</strong> {service_name}</p>
            <p><strong>Date:</strong> {booking.booking_date}</p>
            <p><strong>Time:</strong> {booking.booking_time or 'N/A'}</p>
        </div>
    """

    content_html = f"""
        <p class="text">Hi {booking.client.first_name},</p>
        {status_badge}
        <p class="text">{message_body}</p>
        {details_html}
    """
    
    # Add Review link if completed
    if status == 'completed':
        content_html += f"""
            <p class="text">How was your experience? Please leave a review!</p>
            <a href="{settings.FRONTEND_URL}/services/bookings/{booking.id}/review" class="link-btn">Leave a Review</a>
        """

    footer_text = "Thank you for choosing PetCarePlus."
    html_message = get_email_template(title, content_html, footer_text)

    send_mail(
        subject,
        f"Your booking is {action_text}.",
        settings.DEFAULT_FROM_EMAIL,
        [booking.client.email],
        html_message=html_message,
        fail_silently=True,
    )
