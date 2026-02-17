from datetime import datetime
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.attendance import Attendance, AttendanceCode
from app.core.constants import AttendanceStatus
from app.repositories.base import BaseRepository


class AttendanceRepository(BaseRepository[Attendance]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Attendance)

    async def find_by_user_and_session(
        self, mentee_id: int, session_id: int
    ) -> Attendance | None:
        result = await self.db.execute(
            select(Attendance).where(
                Attendance.mentee_id == mentee_id,
                Attendance.session_id == session_id,
            )
        )
        return result.scalar_one_or_none()

    async def find_by_session_with_mentees(
        self, session_id: int
    ) -> list[Attendance]:
        result = await self.db.execute(
            select(Attendance)
            .options(selectinload(Attendance.mentee))
            .where(Attendance.session_id == session_id)
        )
        return list(result.scalars().all())

    async def get_mentee_attendance_counts(
        self, program_id: int, track: str | None = None
    ) -> list[dict]:
        """Get attendance counts per mentee for scoring."""
        from app.models.mentee import MenteeProfile
        from app.models.session import Session

        query = (
            select(
                MenteeProfile.id.label("mentee_id"),
                MenteeProfile.mentee_id.label("mentee_program_id"),
                MenteeProfile.full_name,
                MenteeProfile.track,
                func.count(Attendance.id)
                .filter(Attendance.status == AttendanceStatus.PRESENT)
                .label("present_count"),
            )
            .outerjoin(
                Attendance,
                Attendance.mentee_id == MenteeProfile.id,
            )
            .outerjoin(
                Session,
                (Session.id == Attendance.session_id)
                & (Session.is_core_session == True)
                & (Session.program_id == program_id),
            )
            .group_by(MenteeProfile.id)
        )

        if track:
            query = query.where(MenteeProfile.track.ilike(track))

        result = await self.db.execute(query)
        rows = result.all()

        return [
            {
                "mentee_id": row.mentee_id,
                "mentee_program_id": row.mentee_program_id,
                "full_name": row.full_name,
                "track": row.track,
                "present_count": row.present_count or 0,
            }
            for row in rows
        ]

    async def update_status(
        self,
        attendance_id: int,
        status: AttendanceStatus,
        code_submitted_at: datetime | None = None,
    ) -> Attendance:
        result = await self.db.execute(
            select(Attendance).where(Attendance.id == attendance_id)
        )
        attendance = result.scalar_one()
        attendance.status = status
        if code_submitted_at:
            attendance.code_entered_at = code_submitted_at
        await self.db.flush()
        return attendance


class AttendanceCodeRepository(BaseRepository[AttendanceCode]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, AttendanceCode)

    async def get_active_code(
        self, session_id: int, current_time: datetime
    ) -> AttendanceCode | None:
        result = await self.db.execute(
            select(AttendanceCode).where(
                AttendanceCode.session_id == session_id,
                AttendanceCode.expires_at > current_time,
            )
        )
        return result.scalar_one_or_none()

    async def find_by_code(self, code: str) -> AttendanceCode | None:
        result = await self.db.execute(
            select(AttendanceCode).where(AttendanceCode.code == code.upper())
        )
        return result.scalar_one_or_none()
