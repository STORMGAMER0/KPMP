from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.program import Program
from app.repositories.base import BaseRepository


class ProgramRepository(BaseRepository[Program]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, Program)

    async def find_active_program(self) -> Program | None:
        """Find the most recent/active program."""
        result = await self.db.execute(
            select(Program).order_by(Program.start_date.desc()).limit(1)
        )
        return result.scalar_one_or_none()
