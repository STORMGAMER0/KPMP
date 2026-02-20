from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import MIN_MESSAGE_LENGTH
from app.core.exceptions import NotFoundError
from app.repositories.telegram_repo import TelegramStatsRepository, UnmappedTelegramUserRepository
from app.repositories.mentee_repo import MenteeRepository
from app.models.telegram import UnmappedTelegramUser


class TelegramService:
    """Service for processing Telegram updates and managing mappings."""

    IGNORED_MESSAGE_TYPES = {"sticker", "animation", "video_note"}

    def __init__(self, db: AsyncSession):
        self.stats_repo = TelegramStatsRepository(db)
        self.unmapped_repo = UnmappedTelegramUserRepository(db)
        self.mentee_repo = MenteeRepository(db)
        self.db = db

    async def process_update(self, update: dict[str, Any]) -> None:
        """
        Process a Telegram webhook update.
        Silently counts messages from group chats.
        """
        message = update.get("message")
        if not message or not message.get("from"):
            return

        # Only process group/supergroup messages
        chat = message.get("chat", {})
        chat_type = chat.get("type")
        if chat_type not in ("group", "supergroup"):
            return

        # Check if message qualifies for counting
        if not self._is_qualifying_message(message):
            return

        tg_user_id = message["from"]["id"]
        chat_id = chat.get("id")
        telegram_username = message["from"].get("username")

        # Check if user is already mapped to a mentee by telegram_user_id
        mentee = await self.mentee_repo.find_by_telegram_id(tg_user_id)

        # If not mapped by ID, try to auto-match by username
        if mentee is None and telegram_username:
            mentee = await self.mentee_repo.find_by_telegram_username(telegram_username)
            if mentee:
                # Auto-link: save the permanent telegram_user_id to the mentee
                mentee.telegram_user_id = tg_user_id
                await self.db.flush()

        if mentee:
            # User is mapped - increment their message count
            # Default to program_id = 1 (can be made configurable)
            program_id = 1
            await self.stats_repo.increment_count(mentee.id, program_id)
        else:
            # User is not mapped - track in unmapped users table
            telegram_name = self._extract_name(message["from"])
            await self.unmapped_repo.upsert(
                telegram_user_id=tg_user_id,
                telegram_name=telegram_name,
                telegram_username=telegram_username,
                chat_id=chat_id,
            )

    def _is_qualifying_message(self, message: dict[str, Any]) -> bool:
        """Check if a message should be counted based on filtering rules."""
        # Reject forwarded messages
        if message.get("forward_date") or message.get("forward_from"):
            return False

        # Reject stickers, GIFs, video notes
        for msg_type in self.IGNORED_MESSAGE_TYPES:
            if msg_type in message:
                return False

        # For media with captions, check caption length
        if (
            message.get("photo")
            or message.get("video")
            or message.get("document")
            or message.get("audio")
            or message.get("voice")
        ):
            caption = message.get("caption", "")
            return len(caption.strip()) >= MIN_MESSAGE_LENGTH

        # For text messages, check length
        text = message.get("text", "")
        return len(text.strip()) >= MIN_MESSAGE_LENGTH

    def _extract_name(self, from_data: dict[str, Any]) -> str | None:
        """Extract display name from Telegram user data."""
        first_name = from_data.get("first_name", "")
        last_name = from_data.get("last_name", "")
        return f"{first_name} {last_name}".strip() or None

    async def list_unmapped_users(self) -> list[UnmappedTelegramUser]:
        """List all unmapped Telegram users."""
        return await self.unmapped_repo.find_all_ordered()

    async def map_telegram_user(
        self, telegram_user_id: int, mentee_profile_id: int
    ) -> None:
        """Map a Telegram user to a mentee profile."""
        mentee = await self.mentee_repo.find_by_id(mentee_profile_id)
        if mentee is None:
            raise NotFoundError("MenteeProfile", mentee_profile_id)

        # Get unmapped user if exists
        unmapped = await self.unmapped_repo.find_by_telegram_id(telegram_user_id)

        # Update mentee profile with telegram user id
        mentee.telegram_user_id = telegram_user_id

        # Transfer message count if there was an unmapped record
        if unmapped:
            program_id = 1  # Default program

            stat = await self.stats_repo.find_by_mentee_and_program(
                mentee.id, program_id
            )
            if stat:
                stat.message_count += unmapped.message_count
                await self.db.flush()
            else:
                await self.stats_repo.create(
                    mentee_id=mentee.id,
                    program_id=program_id,
                    message_count=unmapped.message_count,
                )

            # Remove from unmapped table
            await self.unmapped_repo.delete(unmapped)

        await self.db.flush()

    async def remove_mapping(self, mentee_id: int) -> None:
        """Remove Telegram mapping from a mentee."""
        mentee = await self.mentee_repo.find_by_id(mentee_id)
        if mentee is None:
            raise NotFoundError("MenteeProfile", mentee_id)

        mentee.telegram_user_id = None
        await self.db.flush()
