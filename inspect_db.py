import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Try to load .env from parent if needed, but root is where we are
load_dotenv(".env")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("DATABASE_URL not found in environment")
    exit(1)

engine = create_engine(DATABASE_URL)

try:
    with engine.connect() as connection:
        print("--- Roles ---")
        result = connection.execute(text("SELECT * FROM roles"))
        roles = result.fetchall()
        for row in roles:
            print(row)
        
        print("\n--- Users (Last 5) ---")
        result = connection.execute(text("SELECT id, email, role_id FROM users ORDER BY id DESC LIMIT 5"))
        users = result.fetchall()
        for row in users:
            print(row)

        print("\n--- Columns in public.users ---")
        result = connection.execute(text("""
            SELECT column_name, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = 'users'
        """))
        columns = result.fetchall()
        for row in columns:
            print(row)
            
        print("\n--- Role Table Check ---")
        result = connection.execute(text("SELECT name FROM roles"))
        roles_list = [r[0] for r in result.fetchall()]
        print(f"Available roles: {roles_list}")
            
except Exception as e:
    print(f"Error: {e}")
