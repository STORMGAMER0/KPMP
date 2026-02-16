from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.telegram import TelegramStat, UnmappedTelegramUser
from app.repositories.base import BaseRepository


class TelegramStatsRepository(BaseRepository[TelegramStat]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, TelegramStat)

    async def find_by_mentee_and_program(
        self, mentee_id: int, program_id: int
    ) -> TelegramStat | None:
        result = await self.db.execute(
            select(TelegramStat).where(
                TelegramStat.mentee_id == mentee_id,
                TelegramStat.program_id == program_id,
            )
        )
        return result.scalar_one_or_none()

    async def get_stats_by_program(
        self, program_id: int, track: str | None = None
    ) -> list[TelegramStat]:
        from app.models.mentee import MenteeProfile

        query = (
            select(TelegramStat)
            .join(MenteeProfile, MenteeProfile.id == TelegramStat.mentee_id)
            .where(TelegramStat.program_id == program_id)
        )

        if track:
            query = query.where(MenteeProfile.track == track)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def increment_count(self, mentee_id: int, program_id: int) -> TelegramStat:
        stat = await self.find_by_mentee_and_program(mentee_id, program_id)
        if stat:
            stat.message_count += 1
            await self.db.flush()
            return stat
        else:
            return await self.create(
                mentee_id=mentee_id,
                program_id=program_id,
                message_count=1,
            )


class UnmappedTelegramUserRepository(BaseRepository[UnmappedTelegramUser]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, UnmappedTelegramUser)

    async def find_by_telegram_id(
        self, telegram_user_id: int
    ) -> UnmappedTelegramUser | None:
        result = await self.db.execute(
            select(UnmappedTelegramUser).where(
                UnmappedTelegramUser.telegram_user_id == telegram_user_id
            )
        )
        return result.scalar_one_or_none()

    async def find_all_ordered(self) -> list[UnmappedTelegramUser]:
        result = await self.db.execute(
            select(UnmappedTelegramUser).order_by(
                UnmappedTelegramUser.first_seen_at.desc()
            )
        )
        return list(result.scalars().all())

    async def upsert(
        self,
        telegram_user_id: int,
        telegram_name: str | None,
        telegram_username: str | None,
        chat_id: int,
    ) -> UnmappedTelegramUser:
        existing = await self.find_by_telegram_id(telegram_user_id)
        if existing:
            existing.display_name = telegram_name
            existing.username = telegram_username
            existing.message_count += 1
            await self.db.flush()
            return existing
        else:
            return await self.create(
                telegram_user_id=telegram_user_id,
                display_name=telegram_name,
                username=telegram_username,
                chat_id=chat_id,
                message_count=1,
            )
