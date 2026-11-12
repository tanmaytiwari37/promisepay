#!/usr/bin/env python
"""
Seed demo users into the main development database.
Run this once after setting up the backend to create persistent demo accounts.

Usage:
    cd backend
    python seed_demo_users.py
"""
import sys
import os

# Add parent directory to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal, Base, engine
from app.models.users import User
from app.core.security import get_password_hash
from app.models import projects, agreements, approvals, submissions, reports, payments  # noqa: F401


def seed_demo_users():
    db = SessionLocal()
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)

        demo_users = [
            {
                "email": "customer@demo.com",
                "password": "demo1234",
                "name": "Demo Customer",
                "role": "customer",
            },
            {
                "email": "freelancer@demo.com",
                "password": "demo1234",
                "name": "Demo Freelancer",
                "role": "freelancer",
            },
            {
                "email": "alice@customer.com",
                "password": "password123",
                "name": "Alice Customer",
                "role": "customer",
            },
            {
                "email": "bob@freelancer.com",
                "password": "password123",
                "name": "Bob Freelancer",
                "role": "freelancer",
            },
        ]

        created = 0
        for user_data in demo_users:
            existing = db.query(User).filter(User.email == user_data["email"]).first()
            if not existing:
                user = User(
                    email=user_data["email"],
                    hashed_password=get_password_hash(user_data["password"]),
                    full_name=user_data["name"],
                    role=user_data["role"],
                )
                db.add(user)
                created += 1
                print(f"✅ Created: {user_data['email']} ({user_data['role']})")
            else:
                print(f"⏭️  Exists: {user_data['email']} ({user_data['role']})")

        db.commit()
        print(f"\n🎉 Done! {created} new users created.")
        print("\n📋 Demo Credentials for teammates:")
        print("=" * 50)
        for u in demo_users:
            print(f"  Role: {u['role'].capitalize()}")
            print(f"  Email: {u['email']}")
            print(f"  Password: {u['password']}")
            print()

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_users()