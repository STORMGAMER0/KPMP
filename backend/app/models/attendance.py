from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Enum, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.core.constants import AttendanceStatus


class Attendance(Base):
    __tablename__ = "attendances"
    __table_args__ = (
        UniqueConstraint("session_id", "mentee_id", name="uq_attendance_session_mentee"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"), index=True)
    mentee_id: Mapped[int] = mapped_column(ForeignKey("mentee_profiles.id"), index=True)
    status: Mapped[AttendanceStatus] = mapped_column(
        Enum(AttendanceStatus), default=AttendanceStatus.NOT_JOINED
    )
    joined_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    code_entered_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    session: Mapped["Session"] = relationship("Session", back_populates="attendances")
    mentee: Mapped["MenteeProfile"] = relationship("MenteeProfile", back_populates="attendances")


class AttendanceCode(Base):
    __tablename__ = "attendance_codes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"), index=True)
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    generated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))

    # Relationships
    session: Mapped["Session"] = relationship("Session", back_populates="attendance_codes")
