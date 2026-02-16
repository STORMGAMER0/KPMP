from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_coordinator
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.services.scoring_service import ScoringService
from app.schemas.leaderboard import LeaderboardEntryResponse

router = APIRouter()


@router.get("", response_model=list[LeaderboardEntryResponse])
async def get_leaderboard(
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
    program_id: int = 1,
    track: str | None = None,
):
    """
    Get leaderboard with attendance and Telegram scores.
    Coordinator only - mentees cannot see the leaderboard.
    """
    service = ScoringService(db)
    try:
        entries = await service.compute_leaderboard(program_id, track)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return [LeaderboardEntryResponse.from_entry(e) for e in entries]
