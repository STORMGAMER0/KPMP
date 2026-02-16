from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.core.constants import AttendanceStatus
from app.models.attendance import Attendance, AttendanceCode


class JoinSessionRequest(BaseModel):
    session_id: int


class SubmitCodeRequest(BaseModel):
    session_id: int
    code: str = Field(..., min_length=4, max_length=10)


class AttendanceResponse(BaseModel):
    id: int
    session_id: int
    mentee_id: int
    status: AttendanceStatus
    joined_at: datetime | None
    code_entered_at: datetime | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_model(cls, attendance: Attendance) -> "AttendanceResponse":
        return cls(
            id=attendance.id,
            session_id=attendance.session_id,
            mentee_id=attendance.mentee_id,
            status=attendance.status,
            joined_at=attendance.joined_at,
            code_entered_at=attendance.code_entered_at,
            created_at=attendance.created_at,
        )


class AttendanceCodeResponse(BaseModel):
    code: str
    expires_at: datetime

    @classmethod
    def from_model(cls, code: AttendanceCode) -> "AttendanceCodeResponse":
        return cls(
            code=code.code,
            expires_at=code.expires_at,
        )


class AttendanceOverrideRequest(BaseModel):
    status: AttendanceStatus


class MenteeAttendanceDetailResponse(BaseModel):
    mentee_id: str
    full_name: str
    track: str
    status: AttendanceStatus
    joined_at: datetime | None
    code_entered_at: datetime | None

    @classmethod
    def from_model(cls, attendance: Attendance) -> "MenteeAttendanceDetailResponse":
        return cls(
            mentee_id=attendance.mentee.mentee_id,
            full_name=attendance.mentee.full_name,
            track=attendance.mentee.track,
            status=attendance.status,
            joined_at=attendance.joined_at,
            code_entered_at=attendance.code_entered_at,
        )
