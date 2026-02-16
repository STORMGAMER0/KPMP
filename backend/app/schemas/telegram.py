from datetime import datetime
from pydantic import BaseModel, ConfigDict

from app.models.telegram import UnmappedTelegramUser


class TelegramMapRequest(BaseModel):
    telegram_user_id: int
    mentee_profile_id: int


class UnmappedTelegramUserResponse(BaseModel):
    id: int
    telegram_user_id: int
    username: str | None
    display_name: str | None
    chat_id: int
    first_seen_at: datetime
    message_count: int

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_model(
        cls, user: UnmappedTelegramUser
    ) -> "UnmappedTelegramUserResponse":
        return cls(
            id=user.id,
            telegram_user_id=user.telegram_user_id,
            username=user.username,
            display_name=user.display_name,
            chat_id=user.chat_id,
            first_seen_at=user.first_seen_at,
            message_count=user.message_count,
        )
