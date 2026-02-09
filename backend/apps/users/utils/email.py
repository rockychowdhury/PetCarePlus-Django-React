from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django_q.tasks import async_task

def get_email_template(title, content_html, footer_text=""):
    """
    Returns a GitHub-style HTML email wrapper.
    """
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
                line-height: 1.5;
                color: #24292f;
                background-color: #ffffff;
                margin: 0;
                padding: 20px;
            }}
            .container {{
                max-width: 544px;
                margin: 0 auto;
                text-align: center;
            }}
            .header {{
                text-align: center;
                margin-bottom: 24px;
            }}
            .logo {{
                width: 48px;
                height: 48px;
            }}
            .box {{
                background-color: #ffffff;
                border: 1px solid #e1e4e8;
                border-radius: 6px;
                padding: 24px;
                text-align: center;
            }}
            .title {{
                font-size: 20px;
                font-weight: 600;
                margin-bottom: 16px;
                color: #24292f;
            }}
            .code {{
                font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, whitespace;
                font-size: 32px;
                font-weight: 600;
                letter-spacing: 4px;
                color: #24292f;
                background-color: #f6f8fa;
                padding: 16px 24px;
                border-radius: 6px;
                margin: 24px 0;
                display: inline-block;
            }}
            .text {{
                font-size: 14px;
                margin-bottom: 16px;
            }}
            .footer {{
                margin-top: 32px;
                font-size: 12px;
                color: #6e7781;
                text-align: center;
            }}
            .link-btn {{
                background-color: #2da44e;
                color: #ffffff !important;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: 600;
                display: inline-block;
                margin: 16px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <svg height="48" viewBox="0 0 16 16" version="1.1" width="48" aria-hidden="true" style="fill: #24292f;">
                    <path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                </svg>
            </div>
            <div class="box">
                <div class="title">{title}</div>
                {content_html}
            </div>
            <div class="footer">
                <p>Thanks,<br>The PetCircle Team</p>
                <p style="margin-top: 10px;">{footer_text}</p>
            </div>
        </div>
    </body>
    </html>
    """

def send_verification_email(email, code):
    subject = 'Verify your identity'
    title = f"Please verify your identity"
    
    content_html = f"""
        <p class="text">Here is your verification code:</p>
        <div class="code">{code}</div>
        <p class="text">This code is valid for 15 minutes and can only be used once.</p>
        <p class="text" style="color: #cf222e;">Please don't share this code with anyone.</p>
    """
    
    footer_text = "You're receiving this email because a verification code was requested for your PetCircle account."
    
    html_message = get_email_template(title, content_html, footer_text)
    plain_message = f"Your verification code is: {code}"
    
    # Send Async
    send_email_task.delay(
        subject,
        plain_message,
        [email],
        html_message=html_message
    )

def send_password_reset_email(email, link):
    subject = 'Reset your password'
    title = f"Reset your password"
    
    content_html = f"""
        <p class="text">We received a request to reset your password.</p>
        <a href="{link}" class="link-btn">Reset Password</a>
        <p class="text">Or copy and paste this link into your browser:</p>
        <p class="text" style="word-break: break-all;"><a href="{link}">{link}</a></p>
        <p class="text">This link is valid for 15 minutes.</p>
    """
    
    footer_text = "If you didn't request a password reset, you can safely ignore this email."
    
    html_message = get_email_template(title, content_html, footer_text)
    plain_message = f"Use this link to reset your password: {link}"
    
    # Send Async
    send_email_task.delay(
        subject,
        plain_message,
        [email],
        html_message=html_message
    )

def send_welcome_email(user):
    subject = 'Welcome to PetCarePlus! 🐾'
    title = f"Welcome, {user.first_name or 'Friend'}!"
    
    content_html = f"""
        <p class="text">We're thrilled to have you join our community.</p>
        <p class="text">You can now explore services, adopt pets, or list your own services.</p>
        <p class="text">If you have any questions, feel free to reply to this email.</p>
        <a href="{getattr(settings, 'FRONTEND_URL', 'https://petcarepp.netlify.app')}/dashboard" class="link-btn">Go to Dashboard</a>
    """
    
    footer_text = "Welcome to the family!"
    
    html_message = get_email_template(title, content_html, footer_text)
    plain_message = f"Welcome to PetCarePlus, {user.first_name}! We're glad you're here."
    
    # Send Async
    async_task(
        'apps.users.tasks.send_email_task',
        subject,
        plain_message,
        [user.email],
        html_message=html_message
    )
