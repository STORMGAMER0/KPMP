import secrets
from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.constants import UserRole
from app.core.exceptions import (
    InvalidCredentialsError,
    InactiveAccountError,
    InvalidCurrentPasswordError,
    PasswordResetNotRequiredError,
    InvalidTokenError,
    InvalidResetTokenError,
)
from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    verify_jwt,
)
from app.repositories.user_repo import UserRepository
from app.repositories.mentee_repo import MenteeRepository
from app.models.user import User
from app.services.email_service import email_service


class AuthService:
    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.mentee_repo = MenteeRepository(db)
        self.db = db

    async def authenticate(
        self, identifier: str, password: str
    ) -> tuple[User, str, str]:
        """
        Authenticate user with email (coordinator) or mentee_id (mentee).
        Returns (user, access_token, refresh_token).
        """
        # Try email first (coordinator login)
        user = await self.user_repo.find_by_email(identifier)

        # If not found, try mentee_id lookup
        if user is None:
            mentee_profile = await self.mentee_repo.find_by_mentee_id_with_user(
                identifier
            )
            if mentee_profile:
                user = mentee_profile.user

        if user is None:
            raise InvalidCredentialsError()

        if not user.is_active:
            raise InactiveAccountError()

        if not verify_password(password, user.password_hash):
            raise InvalidCredentialsError()

        token_data = {"sub": str(user.id), "role": user.role.value}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return user, access_token, refresh_token

    async def refresh_tokens(self, refresh_token: str) -> tuple[User, str, str]:
        """
        Refresh access token using refresh token.
        Returns (user, new_access_token, new_refresh_token).
        """
        payload = verify_jwt(refresh_token, expected_type="refresh")
        user_id = payload.get("sub")

        if user_id is None:
            raise InvalidTokenError("Invalid token payload")

        user = await self.user_repo.find_by_id(int(user_id))

        if user is None or not user.is_active:
            raise InvalidTokenError("User not found or inactive")

        token_data = {"sub": str(user.id), "role": user.role.value}
        new_access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)

        return user, new_access_token, new_refresh_token

    async def change_password(
        self, user: User, current_password: str, new_password: str,
        telegram_username: str | None = None
    ) -> None:
        """Change password for authenticated user. Optionally set telegram username on first login."""
        if not verify_password(current_password, user.password_hash):
            raise InvalidCurrentPasswordError()

        user.password_hash = hash_password(new_password)

        # Save telegram username if provided (for mentees on first login)
        if telegram_username and user.must_reset_password:
            mentee = await self.mentee_repo.find_by_user_id(user.id)
            if mentee:
                # Normalize username (remove @ if present, lowercase)
                clean_username = telegram_username.lstrip('@').lower()
                mentee.telegram_username = clean_username

        user.must_reset_password = False
        await self.db.flush()

    async def reset_password(self, user: User, new_password: str) -> None:
        """Reset password on first login (when must_reset_password is true)."""
        if not user.must_reset_password:
            raise PasswordResetNotRequiredError()

        user.password_hash = hash_password(new_password)
        user.must_reset_password = False
        await self.db.flush()

    async def request_password_reset(self, identifier: str) -> bool:
        """
        Request password reset. Sends email with reset link.
        Returns True if email was sent (or would be sent - we don't reveal if user exists).
        """
        # Find user by email or mentee_id
        user = await self.user_repo.find_by_email(identifier)

        if user is None:
            mentee_profile = await self.mentee_repo.find_by_mentee_id_with_user(identifier)
            if mentee_profile:
                user = mentee_profile.user

        # Always return success to prevent email enumeration
        if user is None or not user.is_active:
            return True

        # Generate secure reset token
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        await self.db.flush()

        # Build reset link
        settings = get_settings()
        frontend_url = settings.frontend_url.rstrip('/')
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"

        # Get user name for email
        user_name = user.email
        if user.mentee_profile:
            user_name = user.mentee_profile.full_name

        # Send email
        await email_service.send_password_reset(
            to_email=user.email,
            user_name=user_name,
            reset_link=reset_link,
        )

        return True

    async def reset_password_with_token(self, token: str, new_password: str) -> None:
        """Reset password using reset token from email."""
        user = await self.user_repo.find_by_reset_token(token)

        if user is None:
            raise InvalidResetTokenError()

        if user.reset_token_expires is None or user.reset_token_expires < datetime.utcnow():
            raise InvalidResetTokenError()

        # Update password and clear token
        user.password_hash = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        user.must_reset_password = False
        await self.db.flush()
