from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app import models
from app.core import security

def seed_db():
    db = SessionLocal()
    try:
        # Create roles if they don't exist
        admin_role = db.query(models.Role).filter(models.Role.name == "admin").first()
        if not admin_role:
            admin_role = models.Role(name="admin", description="Full system access")
            db.add(admin_role)
            db.commit()
            db.refresh(admin_role)
        
        recruiter_role = db.query(models.Role).filter(models.Role.name == "recruiter").first()
        if not recruiter_role:
            recruiter_role = models.Role(name="recruiter", description="Manage candidates and interviews")
            db.add(recruiter_role)
            db.commit()

        # Create default admin user
        admin_user = db.query(models.User).filter(models.User.email == "admin@talentlens.com").first()
        if not admin_user:
            admin_user = models.User(
                email="admin@talentlens.com",
                hashed_password=security.get_password_hash("admin123"),
                role_id=admin_role.id
            )
            db.add(admin_user)
            db.commit()
            print("Successfully seeded admin user: admin@talentlens.com / admin123")
        else:
            print("Admin user already exists.")
            
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
