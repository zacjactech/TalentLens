import sys
import os
from datetime import datetime
from sqlalchemy.orm import Session

# Add backend to path so we can import app
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.db.database import SessionLocal, engine
from app import models
from app.core import security

def seed_data():
    db = SessionLocal()
    try:
        # 1. Seed Roles
        print("Seeding Roles...")
        roles = {
            "admin": "Full system access",
            "recruiter": "Standard recruiter and candidate management access"
        }
        role_objs = {}
        for role_name, desc in roles.items():
            role = db.query(models.Role).filter(models.Role.name == role_name).first()
            if not role:
                role = models.Role(name=role_name, description=desc)
                db.add(role)
                db.commit()
                db.refresh(role)
            role_objs[role_name] = role

        # 2. Seed Users
        print("Seeding Users...")
        admin_email = "hr@talentlens.demo"
        admin_user = db.query(models.User).filter(models.User.email == admin_email).first()
        if not admin_user:
            admin_user = models.User(
                email=admin_email,
                hashed_password=security.get_password_hash("talentlens2024"),
                role_id=role_objs["recruiter"].id
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            
            # Create user settings
            settings = models.UserSettings(user_id=admin_user.id, theme="dark")
            db.add(settings)
            db.commit()

        # 3. Seed Job Postings
        print("Seeding Job Postings...")
        jobs = [
            {
                "title": "Senior React Developer",
                "department": "Engineering",
                "location": "Remote",
                "type": "Full-time",
                "status": "Active",
                "description": "Looking for a seasoned React developer to lead our frontend efforts.",
                "requirements": "5+ years React, TypeScript, Tailwind CSS, State Management."
            },
            {
                "title": "HR Specialist",
                "department": "Human Resources",
                "location": "New York, NY",
                "type": "Full-time",
                "status": "Active",
                "description": "Join our HR team to help manage talent acquisition and employee relations.",
                "requirements": "Excellent communication, 3+ years in HR, proficient in ATS."
            },
            {
                "title": "Data Scientist",
                "department": "Analytics",
                "location": "San Francisco, CA",
                "type": "Full-time",
                "status": "Active",
                "description": "We need a data wizard to help us build predictive models for recruitment.",
                "requirements": "Python, SQL, Machine Learning, degree in CS/Math."
            }
        ]
        for job_data in jobs:
            job = db.query(models.JobPosting).filter(models.JobPosting.title == job_data["title"]).first()
            if not job:
                job = models.JobPosting(**job_data)
                db.add(job)
        db.commit()

        # 4. Seed Candidates
        print("Seeding Candidates...")
        candidates = [
            {
                "first_name": "Sarah",
                "last_name": "Johnson",
                "email": "sarah.j@example.com",
                "phone": "+1 555-0101",
                "target_role": "Senior React Developer",
                "status": "shortlisted",
                "years_of_experience": 6,
                "source": "LinkedIn"
            },
            {
                "first_name": "Michael",
                "last_name": "Chen",
                "email": "m.chen@example.com",
                "phone": "+1 555-0102",
                "target_role": "Data Scientist",
                "status": "interviewed",
                "years_of_experience": 4,
                "source": "Referral"
            },
            {
                "first_name": "Elena",
                "last_name": "Rodriguez",
                "email": "elena.rod@example.com",
                "phone": "+1 555-0103",
                "target_role": "HR Specialist",
                "status": "pending",
                "years_of_experience": 5,
                "source": "Indeed"
            }
        ]
        
        for cand_data in candidates:
            cand = db.query(models.Candidate).filter(models.Candidate.email == cand_data["email"]).first()
            if not cand:
                cand = models.Candidate(**cand_data)
                db.add(cand)
                db.commit()
                db.refresh(cand)
                
                # Create Score
                exp_years = int(cand_data["years_of_experience"])
                score = models.CandidateScore(
                    candidate_id=cand.id,
                    experience_fit=25.0 if exp_years > 5 else 20.0,
                    career_stability=18.0,
                    communication_quality=17.0,
                    typing_test=12.0,
                    role_specific=13.0,
                    overall_score=85.0 if exp_years > 5 else 78.0
                )
                db.add(score)
                
                # Create Profile
                profile = models.CandidateProfile(
                    candidate_id=cand.id,
                    summary=f"Experienced professional with {cand_data['years_of_experience']} years in the field.",
                    skills_analysis="Strong match for core requirements. Demonstrated expertise in target role domain.",
                    career_stability_analysis="Consistent tenure at previous organizations.",
                    communication_evaluation="Articulate and professional in initial outreach.",
                    final_evaluation="Highly recommended for further assessment."
                )
                db.add(profile)
        db.commit()

        print("Seeding completed successfully!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
