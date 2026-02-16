from datetime import date, time, datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.core.constants import ResourceType
from app.repositories.session_repo import SessionRepository, SessionResourceRepository
from app.repositories.attendance_repo import AttendanceCodeRepository
from app.models.session import Session, SessionResource


class SessionService:
    def __init__(self, db: AsyncSession):
        self.repo = SessionRepository(db)
        self.resource_repo = SessionResourceRepository(db)
        self.code_repo = AttendanceCodeRepository(db)
        self.db = db

    async def list_sessions(self, program_id: int | None = None) -> list[Session]:
        """List all sessions, optionally filtered by program."""
        return await self.repo.find_all_by_program(program_id)

    async def get_session(self, session_id: int) -> Session:
        """Get a session by ID with resources."""
        session = await self.repo.find_by_id_with_resources(session_id)
        if session is None:
            raise NotFoundError("Session", session_id)
        return session

    async def create_session(
        self,
        program_id: int,
        title: str,
        session_date: date,
        start_time: time,
        end_time: time,
        description: str | None = None,
        google_meet_link: str | None = None,
        is_core_session: bool = True,
    ) -> Session:
        """Create a new session."""
        session = await self.repo.create(
            program_id=program_id,
            title=title,
            description=description,
            date=session_date,
            start_time=start_time,
            end_time=end_time,
            google_meet_link=google_meet_link,
            is_core_session=is_core_session,
        )
        # Reload with resources relationship
        return await self.repo.find_by_id_with_resources(session.id)

    async def update_session(
        self,
        session_id: int,
        title: str | None = None,
        description: str | None = None,
        session_date: date | None = None,
        start_time: time | None = None,
        end_time: time | None = None,
        google_meet_link: str | None = None,
        is_core_session: bool | None = None,
    ) -> Session:
        """Update a session."""
        session = await self.repo.find_by_id_with_resources(session_id)
        if session is None:
            raise NotFoundError("Session", session_id)

        if title is not None:
            session.title = title
        if description is not None:
            session.description = description
        if session_date is not None:
            session.date = session_date
        if start_time is not None:
            session.start_time = start_time
        if end_time is not None:
            session.end_time = end_time
        if google_meet_link is not None:
            session.google_meet_link = google_meet_link
        if is_core_session is not None:
            session.is_core_session = is_core_session

        await self.db.flush()
        return session

    async def delete_session(self, session_id: int) -> None:
        """Delete a session."""
        session = await self.repo.find_by_id(session_id)
        if session is None:
            raise NotFoundError("Session", session_id)
        await self.repo.delete(session)

    async def add_resource(
        self,
        session_id: int,
        resource_type: ResourceType,
        title: str,
        url: str | None = None,
        speaker_name: str | None = None,
        speaker_bio: str | None = None,
        speaker_linkedin: str | None = None,
    ) -> SessionResource:
        """Add a resource to a session."""
        session = await self.repo.find_by_id(session_id)
        if session is None:
            raise NotFoundError("Session", session_id)

        return await self.resource_repo.create(
            session_id=session_id,
            type=resource_type,
            title=title,
            url=url,
            speaker_name=speaker_name,
            speaker_bio=speaker_bio,
            speaker_linkedin=speaker_linkedin,
        )

    async def delete_resource(self, session_id: int, resource_id: int) -> None:
        """Delete a resource from a session."""
        resource = await self.resource_repo.find_by_id(resource_id)
        if resource is None or resource.session_id != session_id:
            raise NotFoundError("SessionResource", resource_id)
        await self.resource_repo.delete(resource)

    async def get_upcoming_session(self) -> Session | None:
        """Get the next upcoming session."""
        now = datetime.now(timezone.utc)
        return await self.repo.find_upcoming_session(now.date(), now.time())

    async def get_upcoming_session_with_code_status(
        self,
    ) -> tuple[Session | None, bool]:
        """
        Get the next upcoming session and whether it has an active code.
        Returns (session, has_active_code).
        """
        session = await self.get_upcoming_session()
        if session is None:
            return None, False

        now = datetime.now(timezone.utc)
        active_code = await self.code_repo.get_active_code(session.id, now)
        return session, active_code is not None
