import os
import sys
import subprocess

# The remote Supabase URL found in seed_supabase.py
REMOTE_DB_URL = "postgresql://postgres.dzgyeggprymdhobnyxke:juYm8U8LnEay1Owj@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"

# Set the environment variable for the script
os.environ["DATABASE_URL"] = REMOTE_DB_URL

print(f"Executing seeding script against remote database...")

# Add backend to path so we can import app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

# Use the logic from seed_v2.py
try:
    from backend.app.db.seed_v2 import seed_data
    seed_data()
    print("Remote seeding completed successfully!")
except Exception as e:
    print(f"Remote seeding failed: {e}")
    import traceback
    traceback.print_exc()
