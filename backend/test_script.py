import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PetCarePlus.settings')
django.setup()

from django.test import Client
import traceback

c = Client()
try:
    r = c.get('/api/rehoming/listings/')
    print(f"Status Code: {r.status_code}")
    if r.status_code == 500:
        print("Response content:")
        print(r.content.decode('utf-8'))
except Exception as e:
    print("Exception occurred:")
    traceback.print_exc()
