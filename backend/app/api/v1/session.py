from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_coordinator
from app.core.exceptions import NotFoundError
from app.models.user import User
from app.services.session_service import SessionService
from app.schemas.session import (
    SessionCreateRequest,
    SessionUpdateRequest,
    SessionResponse,
    SessionResourceCreateRequest,
    SessionResourceResponse,
)

router = APIRouter()


@router.get("", response_model=list[SessionResponse])
async def list_sessions(
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
    program_id: int | None = None,
):
    """List all sessions (coordinator only)."""
    service = SessionService(db)
    sessions = await service.list_sessions(program_id)
    return [SessionResponse.from_model(s) for s in sessions]


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
async def create_session(
    request: SessionCreateRequest,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a new session (coordinator only)."""
    service = SessionService(db)
    session = await service.create_session(
        program_id=request.program_id,
        title=request.title,
        session_date=request.date,
        start_time=request.start_time,
        end_time=request.end_time,
        description=request.description,
        google_meet_link=request.google_meet_link,
        is_core_session=request.is_core_session,
    )
    return SessionResponse.from_model(session)


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: int,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get session details (coordinator only)."""
    service = SessionService(db)
    try:
        session = await service.get_session(session_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return SessionResponse.from_model(session)


@router.patch("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: int,
    updates: SessionUpdateRequest,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update a session (coordinator only)."""
    service = SessionService(db)
    try:
        session = await service.update_session(
            session_id=session_id,
            title=updates.title,
            description=updates.description,
            session_date=updates.date,
            start_time=updates.start_time,
            end_time=updates.end_time,
            google_meet_link=updates.google_meet_link,
            is_core_session=updates.is_core_session,
        )
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return SessionResponse.from_model(session)


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(
    session_id: int,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Delete a session (coordinator only)."""
    service = SessionService(db)
    try:
        await service.delete_session(session_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )


@router.post(
    "/{session_id}/resources",
    response_model=SessionResourceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_session_resource(
    session_id: int,
    request: SessionResourceCreateRequest,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Add a resource to a session (coordinator only)."""
    service = SessionService(db)
    try:
        resource = await service.add_resource(
            session_id=session_id,
            resource_type=request.type,
            title=request.title,
            url=request.url,
            speaker_name=request.speaker_name,
            speaker_bio=request.speaker_bio,
            speaker_linkedin=request.speaker_linkedin,
        )
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
    return SessionResourceResponse.from_model(resource)


@router.delete(
    "/{session_id}/resources/{resource_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_session_resource(
    session_id: int,
    resource_id: int,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Remove a resource from a session (coordinator only)."""
    service = SessionService(db)
    try:
        await service.delete_resource(session_id, resource_id)
    except NotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
        )
