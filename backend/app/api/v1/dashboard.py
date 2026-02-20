from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_coordinator
from app.models.user import User
from app.models.attendance import Attendance
from app.models.session import Session
from app.models.mentee import MenteeProfile
from app.models.telegram import TelegramStat
from app.core.constants import AttendanceStatus

router = APIRouter()


@router.get("/stats")
async def get_dashboard_stats(
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get dashboard statistics."""

    # Total mentees
    mentee_count = await db.scalar(select(func.count(MenteeProfile.id)))

    # Mentees with telegram linked (telegram_user_id is not null)
    telegram_linked_count = await db.scalar(
        select(func.count(MenteeProfile.id)).where(
            MenteeProfile.telegram_user_id.isnot(None)
        )
    )

    # Total telegram messages across all mentees
    total_messages = await db.scalar(
        select(func.coalesce(func.sum(TelegramStat.message_count), 0))
    ) or 0

    # Core sessions count
    core_sessions_count = await db.scalar(
        select(func.count(Session.id)).where(Session.is_core_session == True)
    ) or 0

    # Attendance stats for core sessions
    # Count PRESENT attendances
    present_count = await db.scalar(
        select(func.count(Attendance.id))
        .join(Session, Attendance.session_id == Session.id)
        .where(
            Session.is_core_session == True,
            Attendance.status == AttendanceStatus.PRESENT
        )
    ) or 0

    # Calculate expected attendance (mentees * core sessions)
    expected_attendance = (mentee_count or 0) * (core_sessions_count or 0)

    # Attendance rate
    attendance_rate = 0.0
    if expected_attendance > 0:
        attendance_rate = (present_count / expected_attendance) * 100

    return {
        "total_mentees": mentee_count or 0,
        "telegram_linked": telegram_linked_count or 0,
        "telegram_messages": total_messages,
        "core_sessions": core_sessions_count,
        "attendance_rate": round(attendance_rate, 1),
        "present_count": present_count,
    }
