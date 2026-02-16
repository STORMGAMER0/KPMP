from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_coordinator
from app.core.exceptions import NotFoundError, CSVImportError
from app.models.user import User
from app.services.csv_import_service import CSVImportService
from app.services.mentee_service import MenteeService
from app.schemas.mentee import (
    MenteeProfileResponse,
    MenteeAdminUpdateRequest,
    MenteeImportResultResponse,
)

router = APIRouter()


@router.post("/mentees/import", response_model=MenteeImportResultResponse)
async def import_mentees_csv(
    file: Annotated[UploadFile, File(description="CSV file with mentee data")],
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """
    Bulk import mentees from CSV file.
    Expected columns: mentee_id, name, email, track, default_password
    """
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV",
        )

    content = await file.read()
    service = CSVImportService(db)

    try:
        result = await service.import_mentees(content)
    except CSVImportError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )

    return MenteeImportResultResponse(
        total=result.total,
        created=result.created,
        skipped=result.skipped,
        errors=result.errors,
    )


@router.get("/mentees", response_model=list[MenteeProfileResponse])
async def list_mentees(
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
    track: str | None = None,
    search: str | None = None,
):
    """List all mentees with optional filtering (coordinator only)."""
    service = MenteeService(db)
    mentees = await service.list_mentees(track=track, search=search)
    return [MenteeProfileResponse.from_model(m) for m in mentees]


@router.get("/mentees/{mentee_id}", response_model=MenteeProfileResponse)
async def get_mentee(
    mentee_id: int,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get a specific mentee's details (coordinator only)."""
    service = MenteeService(db)
    try:
        mentee = await service.get_by_id(mentee_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return MenteeProfileResponse.from_model(mentee)


@router.patch("/mentees/{mentee_id}", response_model=MenteeProfileResponse)
async def update_mentee(
    mentee_id: int,
    updates: MenteeAdminUpdateRequest,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update a mentee's profile (coordinator only)."""
    service = MenteeService(db)
    try:
        mentee = await service.update_mentee(
            mentee_id=mentee_id,
            full_name=updates.full_name,
            track=updates.track,
            profile_pic_url=updates.profile_pic_url,
        )
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return MenteeProfileResponse.from_model(mentee)
