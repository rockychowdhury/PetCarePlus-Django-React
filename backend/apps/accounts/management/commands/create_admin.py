"""
Management command to create a default admin user.
Run: python manage.py create_admin
"""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create default admin user (admin@example.com / admin123)'

    def handle(self, *args, **options):
        email = 'admin@example.com'
        password = 'admin' # keeping it simple for dev

        if User.objects.filter(email=email).exists():
            self.stdout.write(f'Admin user {email} already exists.')
            return

        User.objects.create_superuser(
            email=email,
            password=password,
            first_name='System',
            last_name='Admin'
        )

        self.stdout.write(self.style.SUCCESS(f'Created admin user: {email} / {password}'))
