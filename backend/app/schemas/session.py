from datetime import datetime, date as date_type, time as time_type, timezone
from pydantic import BaseModel, ConfigDict

from app.core.constants import ResourceType
from app.models.session import Session, SessionResource


class SessionResourceResponse(BaseModel):
    id: int
    session_id: int
    type: ResourceType
    title: str
    url: str | None
    speaker_name: str | None
    speaker_bio: str | None
    speaker_linkedin: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_model(cls, resource: SessionResource) -> "SessionResourceResponse":
        return cls(
            id=resource.id,
            session_id=resource.session_id,
            type=resource.type,
            title=resource.title,
            url=resource.url,
            speaker_name=resource.speaker_name,
            speaker_bio=resource.speaker_bio,
            speaker_linkedin=resource.speaker_linkedin,
            created_at=resource.created_at,
        )


class SessionResourceCreateRequest(BaseModel):
    type: ResourceType
    title: str
    url: str | None = None
    speaker_name: str | None = None
    speaker_bio: str | None = None
    speaker_linkedin: str | None = None


class SessionResponse(BaseModel):
    id: int
    program_id: int
    title: str
    description: str | None
    date: date_type
    start_time: time_type
    end_time: time_type
    google_meet_link: str | None
    is_core_session: bool
    created_at: datetime
    resources: list[SessionResourceResponse]

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_model(cls, session: Session) -> "SessionResponse":
        return cls(
            id=session.id,
            program_id=session.program_id,
            title=session.title,
            description=session.description,
            date=session.date,
            start_time=session.start_time,
            end_time=session.end_time,
            google_meet_link=session.google_meet_link,
            is_core_session=session.is_core_session,
            created_at=session.created_at,
            resources=[
                SessionResourceResponse.from_model(r) for r in session.resources
            ],
        )


class SessionCreateRequest(BaseModel):
    program_id: int
    title: str
    description: str | None = None
    date: date_type
    start_time: time_type
    end_time: time_type
    google_meet_link: str | None = None
    is_core_session: bool = True


class SessionUpdateRequest(BaseModel):
    title: str | None = None
    description: str | None = None
    date: date_type | None = None
    start_time: time_type | None = None
    end_time: time_type | None = None
    google_meet_link: str | None = None
    is_core_session: bool | None = None


class SessionWithCountdownResponse(SessionResponse):
    countdown_seconds: int
    has_active_code: bool

    @classmethod
    def from_model(
        cls, session: Session, has_active_code: bool
    ) -> "SessionWithCountdownResponse":
        now = datetime.now(timezone.utc)
        session_start = datetime.combine(
            session.date, session.start_time, tzinfo=timezone.utc
        )
        countdown_seconds = max(0, int((session_start - now).total_seconds()))

        return cls(
            id=session.id,
            program_id=session.program_id,
            title=session.title,
            description=session.description,
            date=session.date,
            start_time=session.start_time,
            end_time=session.end_time,
            google_meet_link=session.google_meet_link,
            is_core_session=session.is_core_session,
            created_at=session.created_at,
            resources=[
                SessionResourceResponse.from_model(r) for r in session.resources
            ],
            countdown_seconds=countdown_seconds,
            has_active_code=has_active_code,
        )
