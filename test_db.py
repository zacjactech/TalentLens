import os
import psycopg2
from dotenv import load_dotenv

# Load .env
load_dotenv(".env")

db_url = os.getenv("DATABASE_URL")
print(f"Testing connection to: {db_url}")

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    cur.execute("SELECT version();")
    record = cur.fetchone()
    print(f"Connected to: {record}")
    
    cur.execute("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';")
    tables = cur.fetchall()
    print(f"Tables in public schema: {tables}")
    
    cur.close()
    conn.close()
    print("Connection test successful!")
except Exception as e:
    print(f"Connection failed: {e}")
