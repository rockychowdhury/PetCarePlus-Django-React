import os
import sys
import django

sys.path.append(r'c:\Users\rabbi\OneDrive\Desktop\Django\PetCarePlus-Django-React\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.conf import settings
from google import genai

def list_models():
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        for model in client.models.list():
            print(f"Model: {model.name}")
            print(f"  Supported generation methods: {model.supported_generation_methods}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    list_models()
