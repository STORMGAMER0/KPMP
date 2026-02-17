from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_mentee, get_current_coordinator
from app.core.exceptions import (
    NotFoundError,
    NotJoinedError,
    AlreadyPresentError,
    CodeWindowClosedError,
    InvalidCodeError,
)
from app.models.user import User
from app.services.attendance_service import AttendanceService
from app.schemas.attendance import (
    JoinSessionRequest,
    SubmitCodeRequest,
    AttendanceResponse,
    AttendanceCodeResponse,
    AttendanceOverrideRequest,
    MenteeAttendanceDetailResponse,
)

router = APIRouter()


@router.post("/join", response_model=AttendanceResponse)
async def join_session(
    request: JoinSessionRequest,
    current_user: Annotated[User, Depends(get_current_mentee)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Mentee joins a session - creates PARTIAL attendance record."""
    service = AttendanceService(db)
    try:
        attendance = await service.record_join(current_user.id, request.session_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return AttendanceResponse.from_model(attendance)


@router.post("/code", response_model=AttendanceResponse)
async def submit_attendance_code(
    request: SubmitCodeRequest,
    current_user: Annotated[User, Depends(get_current_mentee)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Mentee submits attendance code - upgrades from PARTIAL to PRESENT."""
    service = AttendanceService(db)
    try:
        attendance = await service.submit_code(
            current_user.id, request.session_id, request.code
        )
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    except NotJoinedError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )
    except AlreadyPresentError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )
    except CodeWindowClosedError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=e.message,
        )
    except InvalidCodeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message,
        )
    return AttendanceResponse.from_model(attendance)


@router.post(
    "/sessions/{session_id}/generate-code",
    response_model=AttendanceCodeResponse,
)
async def generate_session_code(
    session_id: int,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Generate attendance code for a session (coordinator only)."""
    service = AttendanceService(db)
    try:
        code = await service.generate_code(session_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return AttendanceCodeResponse.from_model(code)


@router.get(
    "/sessions/{session_id}",
    response_model=list[MenteeAttendanceDetailResponse],
)
async def get_session_attendance(
    session_id: int,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get attendance details for all mentees for a session (coordinator only)."""
    service = AttendanceService(db)
    try:
        attendances = await service.get_session_attendance(session_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    # attendances is already a list of dicts matching MenteeAttendanceDetailResponse
    return attendances


@router.patch("/{attendance_id}", response_model=AttendanceResponse)
async def override_attendance(
    attendance_id: int,
    request: AttendanceOverrideRequest,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Manually override attendance status (coordinator only)."""
    service = AttendanceService(db)
    try:
        attendance = await service.override_attendance(attendance_id, request.status)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return AttendanceResponse.from_model(attendance)


@router.post("/sessions/{session_id}/mentee/{mentee_id}", response_model=AttendanceResponse)
async def create_attendance(
    session_id: int,
    mentee_id: int,
    request: AttendanceOverrideRequest,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create attendance record for a mentee (coordinator only)."""
    service = AttendanceService(db)
    try:
        attendance = await service.create_attendance(session_id, mentee_id, request.status)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return AttendanceResponse.from_model(attendance)
