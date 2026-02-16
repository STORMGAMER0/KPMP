from datetime import date, time
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.session import Session, SessionResource
from app.repositories.base import BaseRepository


class SessionRepository(BaseRepository[Session]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Session)

    async def find_by_id_with_resources(self, session_id: int) -> Session | None:
        result = await self.db.execute(
            select(Session)
            .options(selectinload(Session.resources))
            .where(Session.id == session_id)
        )
        return result.scalar_one_or_none()

    async def find_all_by_program(
        self, program_id: int | None = None
    ) -> list[Session]:
        query = select(Session).options(selectinload(Session.resources))

        if program_id:
            query = query.where(Session.program_id == program_id)

        query = query.order_by(Session.date, Session.start_time)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def find_upcoming_session(
        self, today: date, current_time: time
    ) -> Session | None:
        result = await self.db.execute(
            select(Session)
            .options(selectinload(Session.resources))
            .where(
                or_(
                    Session.date > today,
                    and_(Session.date == today, Session.start_time > current_time),
                )
            )
            .order_by(Session.date, Session.start_time)
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def find_sessions_starting_in_range(
        self, start_date: date, end_date: date
    ) -> list[Session]:
        result = await self.db.execute(
            select(Session)
            .where(Session.date >= start_date, Session.date <= end_date)
            .order_by(Session.date, Session.start_time)
        )
        return list(result.scalars().all())


class SessionResourceRepository(BaseRepository[SessionResource]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, SessionResource)

    async def find_by_session(self, session_id: int) -> list[SessionResource]:
        result = await self.db.execute(
            select(SessionResource).where(SessionResource.session_id == session_id)
        )
        return list(result.scalars().all())
