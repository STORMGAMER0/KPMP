from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_mentee
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.services.mentee_service import MenteeService
from app.services.session_service import SessionService
from app.schemas.mentee import MenteeProfileResponse, MenteeProfileUpdateRequest
from app.schemas.session import SessionWithCountdownResponse

router = APIRouter()


@router.get("/me", response_model=MenteeProfileResponse)
async def get_my_profile(
    current_user: Annotated[User, Depends(get_current_mentee)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get current mentee's profile."""
    service = MenteeService(db)
    try:
        profile = await service.get_profile_by_user_id(current_user.id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )

    return MenteeProfileResponse.from_model(profile)


@router.patch("/me", response_model=MenteeProfileResponse)
async def update_my_profile(
    updates: MenteeProfileUpdateRequest,
    current_user: Annotated[User, Depends(get_current_mentee)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update current mentee's profile (profile picture only for mentees)."""
    service = MenteeService(db)

    if updates.profile_pic_url is None:
        # No update needed, just return current profile
        profile = await service.get_profile_by_user_id(current_user.id)
    else:
        profile = await service.update_profile_picture(
            current_user.id, updates.profile_pic_url
        )

    return MenteeProfileResponse.from_model(profile)


@router.get("/me/upcoming-session", response_model=SessionWithCountdownResponse | None)
async def get_upcoming_session(
    current_user: Annotated[User, Depends(get_current_mentee)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get the next upcoming session for the mentee."""
    service = SessionService(db)
    session, has_active_code = await service.get_upcoming_session_with_code_status()

    if session is None:
        return None

    return SessionWithCountdownResponse.from_model(session, has_active_code)
