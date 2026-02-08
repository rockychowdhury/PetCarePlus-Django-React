import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get('GEMINI_API_KEY')
if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

client = genai.Client(api_key=api_key)

try:
    print("Listing available models:")
    models = list(client.models.list())
    for m in models:
        print(f" - {m.name}")
except Exception as e:
    print(f"Error listing models: {e}")
