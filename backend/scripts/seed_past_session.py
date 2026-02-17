"""Seed script to create a past session with attendance records for testing."""
import asyncio
import sys
from datetime import date, time, datetime, timezone

sys.path.insert(0, ".")

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.session import Session
from app.models.mentee import MenteeProfile
from app.models.attendance import Attendance
from app.core.constants import AttendanceStatus


async def seed():
    async with AsyncSessionLocal() as db:
        # Create a past session (yesterday)
        past_date = date(2025, 2, 15)  # A date in the past

        # Check if session already exists
        result = await db.execute(
            select(Session).where(
                Session.title == "Introduction to Python (Past Session)"
            )
        )
        existing_session = result.scalar_one_or_none()

        if existing_session:
            print(f"Past session already exists with ID: {existing_session.id}")
            session = existing_session
        else:
            # Create the session
            session = Session(
                program_id=1,
                title="Introduction to Python (Past Session)",
                description="A test session that has already occurred for testing attendance features.",
                date=past_date,
                start_time=time(10, 0),
                end_time=time(12, 0),
                google_meet_link="https://meet.google.com/test-past-session",
                is_core_session=True,
            )
            db.add(session)
            await db.flush()
            print(f"Created past session with ID: {session.id}")

        # Get all mentees
        result = await db.execute(select(MenteeProfile))
        mentees = result.scalars().all()

        if not mentees:
            print("No mentees found. Run seed_mentee.py first.")
            return

        # Create varied attendance records for testing
        for i, mentee in enumerate(mentees):
            # Check if attendance already exists
            existing = await db.execute(
                select(Attendance).where(
                    Attendance.session_id == session.id,
                    Attendance.mentee_id == mentee.id,
                )
            )
            if existing.scalar_one_or_none():
                print(f"  Attendance already exists for {mentee.full_name}")
                continue

            # Vary the status based on index
            if i % 3 == 0:
                status = AttendanceStatus.PRESENT
                joined_at = datetime(2025, 2, 15, 10, 5, tzinfo=timezone.utc)
                code_entered_at = datetime(2025, 2, 15, 10, 30, tzinfo=timezone.utc)
            elif i % 3 == 1:
                status = AttendanceStatus.PARTIAL
                joined_at = datetime(2025, 2, 15, 10, 10, tzinfo=timezone.utc)
                code_entered_at = None
            else:
                # Leave as ABSENT (no record) for some mentees
                print(f"  Skipping {mentee.full_name} (will show as ABSENT)")
                continue

            attendance = Attendance(
                session_id=session.id,
                mentee_id=mentee.id,
                status=status,
                joined_at=joined_at,
                code_entered_at=code_entered_at,
            )
            db.add(attendance)
            print(f"  Created {status.value} attendance for {mentee.full_name}")

        await db.commit()
        print("\nDone! Past session created with attendance records.")
        print(f"Session ID: {session.id}")
        print(f"Date: {past_date}")


if __name__ == "__main__":
    asyncio.run(seed())
