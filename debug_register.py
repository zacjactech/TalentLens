import os
import sys

# Add backend to path so we can import app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from app import models, schemas
from app.core import security
from app.api import deps

load_dotenv(".env")

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_register():
    db = SessionLocal()
    try:
        email = "debug_user_1@example.com"
        password = "debugpassword123"
        
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            print(f"User {email} already exists. Deleting...")
            db.delete(user)
            db.commit()
            
        print(f"Attempting to register {email}...")
        
        # Logic from auth.py
        role = db.query(models.Role).filter(models.Role.name == "recruiter").first()
        print(f"Found role: {role.name if role else 'None'} (ID: {role.id if role else 'N/A'})")
        
        user_obj = models.User(
            email=email,
            hashed_password=security.get_password_hash(password),
            role_id=role.id if role else None
        )
        db.add(user_obj)
        print("Committing...")
        db.commit()
        print("Refreshing...")
        db.refresh(user_obj)
        print(f"Success! User ID: {user_obj.id}")
        
    except Exception as e:
        print(f"STATION ERROR: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_register()
