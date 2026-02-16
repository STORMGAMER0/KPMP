from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_coordinator
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.services.telegram_service import TelegramService
from app.schemas.telegram import (
    TelegramMapRequest,
    UnmappedTelegramUserResponse,
)

router = APIRouter()


@router.post("/webhook")
async def telegram_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Handle Telegram webhook updates.
    Silently counts messages from group chats.
    """
    try:
        update = await request.json()
    except Exception:
        return {"ok": True}

    service = TelegramService(db)
    await service.process_update(update)
    return {"ok": True}


@router.get("/unmapped", response_model=list[UnmappedTelegramUserResponse])
async def list_unmapped_users(
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List all unmapped Telegram users (coordinator only)."""
    service = TelegramService(db)
    users = await service.list_unmapped_users()
    return [UnmappedTelegramUserResponse.from_model(u) for u in users]


@router.post("/map")
async def map_telegram_user(
    request: TelegramMapRequest,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Map a Telegram user to a mentee profile (coordinator only)."""
    service = TelegramService(db)
    try:
        await service.map_telegram_user(
            request.telegram_user_id, request.mentee_profile_id
        )
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return {"message": "Telegram user mapped successfully"}


@router.delete("/mapping/{mentee_id}")
async def remove_telegram_mapping(
    mentee_id: int,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Remove Telegram mapping from a mentee (coordinator only)."""
    service = TelegramService(db)
    try:
        await service.remove_mapping(mentee_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return {"message": "Telegram mapping removed"}
