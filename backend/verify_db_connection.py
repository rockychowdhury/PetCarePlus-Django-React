import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

host = os.getenv('SQL_HOST')
dbname = os.getenv('SQL_DATABASE')
user = os.getenv('SQL_USER')
password = os.getenv('SQL_PASSWORD')
port = os.getenv('SQL_PORT', 5432)

print(f"Connecting to {host} as {user}...")

# Add endpoint ID for Koyeb/Neon
options = ''
if host and 'koyeb.app' in host:
    endpoint_id = host.split('.')[0]
    options = f'-c endpoint={endpoint_id}'

try:
    conn = psycopg2.connect(
        host=host,
        database=dbname,
        user=user,
        password=password,
        port=port,
        options=options,
        sslmode='require'
    )
    print("SUCCESS: Connection established!")
    conn.close()
except Exception as e:
    print(f"FAILURE: {e}")
