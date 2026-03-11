import os
import psycopg2
from dotenv import load_dotenv

# Load .env
load_dotenv(".env")

db_url = os.getenv("DATABASE_URL")
if not db_url:
    db_url = "postgresql://postgres.dzgyeggprymdhobnyxke:juYm8U8LnEay1Owj@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

print(f"Seeding connection to: {db_url}")

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Create roles table if it doesn't exist (though migrations should have handled it)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            description TEXT
        );
    """)
    
    # Seed recruiter and admin roles
    roles = [('admin', 'Full platform access'), ('recruiter', 'Standard recruiter access')]
    for role_name, role_desc in roles:
        cur.execute("INSERT INTO roles (name, description) VALUES (%s, %s) ON CONFLICT (name) DO NOTHING;", (role_name, role_desc))
    
    conn.commit()
    cur.close()
    conn.close()
    print("Seeding successful! Roles created.")
except Exception as e:
    print(f"Seeding failed: {e}")
