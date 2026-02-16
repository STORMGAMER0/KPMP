from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: AsyncSession):
        super().__init__(db, User)

    async def find_by_email(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User).where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def find_by_email_with_profile(self, email: str) -> User | None:
        result = await self.db.execute(
            select(User)
            .options(selectinload(User.mentee_profile))
            .where(User.email == email.lower())
        )
        return result.scalar_one_or_none()

    async def create_user(
        self,
        email: str,
        password_hash: str,
        role: str,
        is_active: bool = True,
        must_reset_password: bool = False,
    ) -> User:
        return await self.create(
            email=email.lower(),
            password_hash=password_hash,
            role=role,
            is_active=is_active,
            must_reset_password=must_reset_password,
        )
