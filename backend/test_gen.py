import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ.get('GEMINI_API_KEY')
client = genai.Client(api_key=api_key)

models_to_test = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-2.5-flash']

for model in models_to_test:
    print(f"\nTesting model: {model}")
    try:
        response = client.models.generate_content(
            model=model,
            contents="Say 'Success'"
        )
        print(f"Result for {model}: {response.text}")
    except Exception as e:
        print(f"Failed for {model}: {e}")
