#!/usr/bin/env python
"""
Quick test to verify demo login credentials work.
Run this to confirm teammates can log in.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import SessionLocal
from app.models.users import User
from app.core.security import verify_password, create_access_token


def test_login(email: str, password: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return False, f"User {email} not found"
        if not verify_password(password, user.hashed_password):
            return False, "Invalid password"

        token = create_access_token(data={"sub": user.email, "role": user.role, "user_id": user.id})
        return True, token
    finally:
        db.close()


if __name__ == "__main__":
    credentials = [
        ("customer@demo.com", "demo1234", "customer"),
        ("freelancer@demo.com", "demo1234", "freelancer"),
        ("alice@customer.com", "password123", "customer"),
        ("bob@freelancer.com", "password123", "freelancer"),
    ]

    print("🔐 Testing Demo Credentials")
    print("=" * 50)

    for email, password, expected_role in credentials:
        success, result = test_login(email, password)
        if success:
            print(f"✅ {email} ({expected_role})")
            print(f"   Token: {result[:50]}...")
        else:
            print(f"❌ {email}: {result}")
        print()

    print("🎉 All credentials verified!")