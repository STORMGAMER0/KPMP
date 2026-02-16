import secrets
import string
from datetime import datetime, timezone, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import (
    AttendanceStatus,
    CODE_EXPIRATION_MINUTES,
    CODE_PREFIX,
    CODE_LENGTH,
)
from app.core.exceptions import (
    NotFoundError,
    AlreadyJoinedError,
    NotJoinedError,
    AlreadyPresentError,
    CodeWindowClosedError,
    InvalidCodeError,
)
from app.repositories.attendance_repo import AttendanceRepository, AttendanceCodeRepository
from app.repositories.session_repo import SessionRepository
from app.repositories.mentee_repo import MenteeRepository
from app.models.attendance import Attendance, AttendanceCode


def generate_attendance_code() -> str:
    """Generate a random attendance code in format KPDF-XXXX."""
    chars = string.ascii_uppercase + string.digits
    # Remove ambiguous characters (0, O, I, 1, L)
    chars = chars.replace("0", "").replace("O", "").replace("I", "").replace("1", "").replace("L", "")
    random_part = "".join(secrets.choice(chars) for _ in range(CODE_LENGTH))
    return f"{CODE_PREFIX}-{random_part}"


class AttendanceService:
    def __init__(self, db: AsyncSession):
        self.repo = AttendanceRepository(db)
        self.code_repo = AttendanceCodeRepository(db)
        self.session_repo = SessionRepository(db)
        self.mentee_repo = MenteeRepository(db)
        self.db = db

    async def record_join(self, user_id: int, session_id: int) -> Attendance:
        """
        Record mentee joining a session.
        Creates PARTIAL attendance record.
        """
        # Get mentee profile
        mentee = await self.mentee_repo.find_by_user_id(user_id)
        if mentee is None:
            raise NotFoundError("MenteeProfile", user_id)

        # Check session exists
        session = await self.session_repo.find_by_id(session_id)
        if session is None:
            raise NotFoundError("Session", session_id)

        # Check for existing attendance
        existing = await self.repo.find_by_user_and_session(mentee.id, session_id)

        now = datetime.now(timezone.utc)

        if existing is not None:
            if existing.status != AttendanceStatus.NOT_JOINED:
                # Already joined - return existing record
                return existing
            # Update NOT_JOINED to PARTIAL
            existing.status = AttendanceStatus.PARTIAL
            existing.joined_at = now
            await self.db.flush()
            return existing

        # Create new attendance record
        return await self.repo.create(
            session_id=session_id,
            mentee_id=mentee.id,
            status=AttendanceStatus.PARTIAL,
            joined_at=now,
        )

    async def submit_code(
        self, user_id: int, session_id: int, code: str
    ) -> Attendance:
        """
        Submit attendance code to upgrade from PARTIAL to PRESENT.
        """
        # Get mentee profile
        mentee = await self.mentee_repo.find_by_user_id(user_id)
        if mentee is None:
            raise NotFoundError("MenteeProfile", user_id)

        # Check for existing attendance
        attendance = await self.repo.find_by_user_and_session(mentee.id, session_id)

        if attendance is None:
            raise NotJoinedError(session_id)

        if attendance.status == AttendanceStatus.PRESENT:
            raise AlreadyPresentError(session_id)

        # Validate the code
        now = datetime.now(timezone.utc)
        active_code = await self.code_repo.get_active_code(session_id, now)

        if active_code is None:
            raise CodeWindowClosedError(session_id)

        if active_code.code.upper() != code.upper():
            raise InvalidCodeError()

        # Update attendance to PRESENT
        return await self.repo.update_status(
            attendance.id,
            status=AttendanceStatus.PRESENT,
            code_submitted_at=now,
        )

    async def generate_code(self, session_id: int) -> AttendanceCode:
        """
        Generate attendance code for a session (coordinator action).
        """
        session = await self.session_repo.find_by_id(session_id)
        if session is None:
            raise NotFoundError("Session", session_id)

        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(minutes=CODE_EXPIRATION_MINUTES)

        # Generate unique code
        code = generate_attendance_code()

        # Ensure uniqueness
        while True:
            existing = await self.code_repo.find_by_code(code)
            if existing is None:
                break
            code = generate_attendance_code()

        return await self.code_repo.create(
            session_id=session_id,
            code=code,
            generated_at=now,
            expires_at=expires_at,
        )

    async def get_session_attendance(self, session_id: int) -> list[Attendance]:
        """Get all attendance records for a session."""
        session = await self.session_repo.find_by_id(session_id)
        if session is None:
            raise NotFoundError("Session", session_id)

        return await self.repo.find_by_session_with_mentees(session_id)

    async def override_attendance(
        self, attendance_id: int, status: AttendanceStatus
    ) -> Attendance:
        """Manually override attendance status (coordinator action)."""
        attendance = await self.repo.find_by_id(attendance_id)
        if attendance is None:
            raise NotFoundError("Attendance", attendance_id)

        return await self.repo.update_status(attendance.id, status=status)
