from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.core.exceptions import (
    InvalidCredentialsError,
    InactiveAccountError,
    InvalidCurrentPasswordError,
    PasswordResetNotRequiredError,
    InvalidTokenError,
)
from app.models.user import User
from app.services.auth_service import AuthService
from app.schemas.auth import (
    LoginRequest,
    TokenResponse,
    RefreshRequest,
    PasswordChangeRequest,
    PasswordResetRequest,
    UserInfoResponse,
)

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
async def login(
    request: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Login with email (coordinator) or mentee_id (mentee)."""
    service = AuthService(db)
    try:
        user, access_token, refresh_token = await service.authenticate(
            request.identifier, request.password
        )
    except (InvalidCredentialsError, InactiveAccountError) as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
        )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        must_reset_password=user.must_reset_password,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Refresh access token using refresh token."""
    service = AuthService(db)
    try:
        user, access_token, refresh_token = await service.refresh_tokens(
            request.refresh_token
        )
    except InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message,
        )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        must_reset_password=user.must_reset_password,
    )


@router.post("/change-password")
async def change_password(
    request: PasswordChangeRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Change password for authenticated user. Accepts telegram username on first login."""
    service = AuthService(db)
    try:
        await service.change_password(
            current_user,
            request.current_password,
            request.new_password,
            request.telegram_username,
        )
    except InvalidCurrentPasswordError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )

    return {"message": "Password changed successfully"}


@router.post("/reset-password")
async def reset_password(
    request: PasswordResetRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Reset password on first login (when must_reset_password is true)."""
    service = AuthService(db)
    try:
        await service.reset_password(current_user, request.new_password)
    except PasswordResetNotRequiredError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )

    return {"message": "Password reset successfully"}


@router.get("/me", response_model=UserInfoResponse)
async def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get current user information."""
    return UserInfoResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        must_reset_password=current_user.must_reset_password,
    )
