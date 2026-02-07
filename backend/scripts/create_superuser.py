import os
import django
import sys
from django.contrib.auth import get_user_model

# Set up Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PetCarePlus.settings')
django.setup()

User = get_user_model()

def create_admin():
    if not User.objects.filter(email='admin@example.com').exists():
        print("Creating superuser admin@example.com...")
        User.objects.create_superuser(
            email='admin@example.com',
            first_name='Admin',
            last_name='User',
            phone_number='1234567890',
            password='adminpassword'
        )
        print("Superuser created.")
    else:
        print("Superuser admin@example.com already exists.")

if __name__ == '__main__':
    create_admin()
