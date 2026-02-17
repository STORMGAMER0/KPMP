"""Fix test mentee track value."""
import asyncio
import sys
sys.path.insert(0, ".")

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.mentee import MenteeProfile


async def fix():
    async with AsyncSessionLocal() as db:
        result = await db.execute(
            select(MenteeProfile).where(MenteeProfile.mentee_id == "KPDF-001")
        )
        mentee = result.scalar_one_or_none()

        if mentee:
            old_track = mentee.track
            mentee.track = "ENGINEERING"
            await db.commit()
            print(f"Updated track: '{old_track}' -> 'ENGINEERING'")
        else:
            print("Mentee KPDF-001 not found")


if __name__ == "__main__":
    asyncio.run(fix())
