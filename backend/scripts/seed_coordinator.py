"""Seed script to create a test coordinator user."""
import asyncio
import sys
sys.path.insert(0, ".")

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import User
from app.models.program import Program
from app.core.constants import UserRole
from app.core.security import hash_password


async def seed():
    async with AsyncSessionLocal() as db:
        # Check if coordinator already exists
        result = await db.execute(
            select(User).where(User.email == "admin@kpdf.org")
        )
        existing = result.scalar_one_or_none()

        if existing:
            print("Coordinator already exists: admin@kpdf.org")
        else:
            # Create coordinator
            coordinator = User(
                email="admin@kpdf.org",
                password_hash=hash_password("admin123"),
                role=UserRole.COORDINATOR,
                is_active=True,
                must_reset_password=False,
            )
            db.add(coordinator)
            print("Created coordinator: admin@kpdf.org / admin123")

        # Check if program exists
        result = await db.execute(select(Program).where(Program.id == 1))
        existing_program = result.scalar_one_or_none()

        if existing_program:
            print("Program already exists: Cohort 1")
        else:
            # Create default program
            from datetime import date, timedelta
            program = Program(
                name="Cohort 1",
                start_date=date.today(),
                end_date=date.today() + timedelta(weeks=6),
                total_core_sessions=16,
                telegram_target_messages=50,
            )
            db.add(program)
            print("Created program: Cohort 1")

        await db.commit()
        print("Done!")


if __name__ == "__main__":
    asyncio.run(seed())
