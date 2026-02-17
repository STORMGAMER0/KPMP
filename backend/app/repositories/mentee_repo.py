from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.mentee import MenteeProfile
from app.repositories.base import BaseRepository


class MenteeRepository(BaseRepository[MenteeProfile]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, MenteeProfile)

    async def find_by_mentee_id(self, mentee_id: str) -> MenteeProfile | None:
        result = await self.db.execute(
            select(MenteeProfile).where(MenteeProfile.mentee_id == mentee_id)
        )
        return result.scalar_one_or_none()

    async def find_by_mentee_id_with_user(self, mentee_id: str) -> MenteeProfile | None:
        result = await self.db.execute(
            select(MenteeProfile)
            .options(selectinload(MenteeProfile.user))
            .where(MenteeProfile.mentee_id == mentee_id)
        )
        return result.scalar_one_or_none()

    async def find_by_user_id(self, user_id: int) -> MenteeProfile | None:
        result = await self.db.execute(
            select(MenteeProfile).where(MenteeProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def find_by_user_id_with_user(self, user_id: int) -> MenteeProfile | None:
        result = await self.db.execute(
            select(MenteeProfile)
            .options(selectinload(MenteeProfile.user))
            .where(MenteeProfile.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def find_by_id_with_user(self, profile_id: int) -> MenteeProfile | None:
        result = await self.db.execute(
            select(MenteeProfile)
            .options(selectinload(MenteeProfile.user))
            .where(MenteeProfile.id == profile_id)
        )
        return result.scalar_one_or_none()

    async def find_by_telegram_id(self, telegram_user_id: int) -> MenteeProfile | None:
        result = await self.db.execute(
            select(MenteeProfile).where(
                MenteeProfile.telegram_user_id == telegram_user_id
            )
        )
        return result.scalar_one_or_none()

    async def find_all_with_user(
        self, track: str | None = None, search: str | None = None
    ) -> list[MenteeProfile]:
        query = select(MenteeProfile).options(selectinload(MenteeProfile.user))

        if track:
            query = query.where(MenteeProfile.track == track)

        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                (MenteeProfile.full_name.ilike(search_pattern))
                | (MenteeProfile.mentee_id.ilike(search_pattern))
            )

        query = query.order_by(MenteeProfile.full_name)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def create_profile(
        self,
        user_id: int,
        mentee_id: str,
        full_name: str,
        track: str,
    ) -> MenteeProfile:
        return await self.create(
            user_id=user_id,
            mentee_id=mentee_id,
            full_name=full_name,
            track=track,
        )
