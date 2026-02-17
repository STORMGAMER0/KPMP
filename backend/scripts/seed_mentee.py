"""Seed script to create a test mentee user."""
import asyncio
import sys
sys.path.insert(0, ".")

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.mentee import MenteeProfile
from app.core.constants import UserRole
from app.core.security import hash_password


async def seed():
    async with AsyncSessionLocal() as db:
        mentee_id = "KPDF-001"
        email = "mentee@test.com"

        # Check if mentee already exists
        result = await db.execute(
            select(MenteeProfile).where(MenteeProfile.mentee_id == mentee_id)
        )
        existing = result.scalar_one_or_none()

        if existing:
            print(f"Mentee already exists: {mentee_id}")
        else:
            # Create user
            user = User(
                email=email,
                password_hash=hash_password("test123"),
                role=UserRole.MENTEE,
                is_active=True,
                must_reset_password=False,  # Set to False for easy testing
            )
            db.add(user)
            await db.flush()  # Get the user ID

            # Create mentee profile
            profile = MenteeProfile(
                user_id=user.id,
                mentee_id=mentee_id,
                full_name="Test Mentee",
                track="ENGINEERING",
            )
            db.add(profile)

            print(f"Created mentee:")
            print(f"  Mentee ID: {mentee_id}")
            print(f"  Email: {email}")
            print(f"  Password: test123")
            print(f"  Track: ENGINEERING")

        await db.commit()
        print("Done!")


if __name__ == "__main__":
    asyncio.run(seed())
