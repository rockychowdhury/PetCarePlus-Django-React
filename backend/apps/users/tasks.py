from django.core.mail import send_mail
from django.conf import settings

def send_email_task(subject, message, recipient_list, html_message=None):
    """
    Celery task to send emails asynchronously.
    """
    from_email = getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@petcareplus.com')
    
    send_mail(
        subject,
        message,
        from_email,
        recipient_list,
        html_message=html_message,
        fail_silently=False,
    )
