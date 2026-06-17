"""
Run once to seed demo users into the database:
    python seed_demo_users.py
"""
from database_config import SessionLocal
from controller.auth_controller import register_user
from sqlalchemy.exc import IntegrityError

DEMO_USERS = [
    {"name": "Alex Johnson",  "email": "candidate@hireai.com", "password": "demo123", "role": "candidate"},
    {"name": "Sarah Chen",    "email": "recruiter@hireai.com", "password": "demo123", "role": "recruiter"},
    {"name": "Admin User",    "email": "admin@hireai.com",     "password": "demo123", "role": "admin"},
]

db = SessionLocal()
for u in DEMO_USERS:
    try:
        register_user(db, u["name"], u["email"], u["password"], u["role"])
        print(f"✅ Created: {u['email']}")
    except Exception as e:
        print(f"⚠️  Skipped {u['email']}: {e}")
db.close()
print("Done.")
