from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole
from app.core.exceptions import (
    InvalidCredentialsError,
    InactiveAccountError,
    InvalidCurrentPasswordError,
    PasswordResetNotRequiredError,
    InvalidTokenError,
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
        self, user: User, current_password: str, new_password: str
    ) -> None:
        """Change password for authenticated user."""
        if not verify_password(current_password, user.password_hash):
            raise InvalidCurrentPasswordError()

        user.password_hash = hash_password(new_password)
        user.must_reset_password = False
        await self.db.flush()

    async def reset_password(self, user: User, new_password: str) -> None:
        """Reset password on first login (when must_reset_password is true)."""
        if not user.must_reset_password:
            raise PasswordResetNotRequiredError()

        user.password_hash = hash_password(new_password)
        user.must_reset_password = False
        await self.db.flush()
