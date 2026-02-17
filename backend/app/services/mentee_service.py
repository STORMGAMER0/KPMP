from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.repositories.mentee_repo import MenteeRepository
from app.models.mentee import MenteeProfile


class MenteeService:
    def __init__(self, db: AsyncSession):
        self.repo = MenteeRepository(db)
        self.db = db

    async def get_profile_by_user_id(self, user_id: int) -> MenteeProfile:
        """Get mentee profile for a user."""
        profile = await self.repo.find_by_user_id_with_user(user_id)
        if profile is None:
            raise NotFoundError("MenteeProfile", user_id)
        return profile

    async def update_profile_picture(
        self, user_id: int, profile_pic_url: str
    ) -> MenteeProfile:
        """Update mentee's profile picture."""
        profile = await self.repo.find_by_user_id_with_user(user_id)
        if profile is None:
            raise NotFoundError("MenteeProfile", user_id)

        profile.profile_pic_url = profile_pic_url
        await self.db.flush()
        return profile

    async def list_mentees(
        self, track: str | None = None, search: str | None = None
    ) -> list[MenteeProfile]:
        """List all mentees with optional filtering."""
        return await self.repo.find_all_with_user(track=track, search=search)

    async def get_by_id(self, mentee_id: int) -> MenteeProfile:
        """Get mentee by profile ID."""
        profile = await self.repo.find_by_id_with_user(mentee_id)
        if profile is None:
            raise NotFoundError("MenteeProfile", mentee_id)
        return profile

    async def update_mentee(
        self,
        mentee_id: int,
        full_name: str | None = None,
        track: str | None = None,
        profile_pic_url: str | None = None,
    ) -> MenteeProfile:
        """Update mentee profile (coordinator action)."""
        profile = await self.repo.find_by_id_with_user(mentee_id)
        if profile is None:
            raise NotFoundError("MenteeProfile", mentee_id)

        if full_name is not None:
            profile.full_name = full_name
        if track is not None:
            profile.track = track
        if profile_pic_url is not None:
            profile.profile_pic_url = profile_pic_url

        await self.db.flush()
        return profile
