from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.mentee import MenteeProfile


class MenteeProfileResponse(BaseModel):
    id: int
    mentee_id: str
    full_name: str
    email: str
    track: str
    profile_pic_url: str | None
    telegram_user_id: int | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_model(cls, profile: MenteeProfile) -> "MenteeProfileResponse":
        return cls(
            id=profile.id,
            mentee_id=profile.mentee_id,
            full_name=profile.full_name,
            email=profile.user.email,
            track=profile.track,
            profile_pic_url=profile.profile_pic_url,
            telegram_user_id=profile.telegram_user_id,
            created_at=profile.created_at,
        )


class MenteeProfileUpdateRequest(BaseModel):
    profile_pic_url: str | None = None


class MenteeAdminUpdateRequest(BaseModel):
    full_name: str | None = None
    track: str | None = None
    profile_pic_url: str | None = None


class MenteeImportResultResponse(BaseModel):
    total: int
    created: int
    skipped: int
    errors: list[str]
