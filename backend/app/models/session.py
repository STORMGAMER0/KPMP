from datetime import datetime, date, time
from sqlalchemy import String, Text, Boolean, Date, Time, ForeignKey, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base
from app.core.constants import ResourceType


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    program_id: Mapped[int] = mapped_column(ForeignKey("programs.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    date: Mapped[date] = mapped_column(Date, index=True)
    start_time: Mapped[time] = mapped_column(Time)
    end_time: Mapped[time] = mapped_column(Time)
    google_meet_link: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_core_session: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    program: Mapped["Program"] = relationship("Program", back_populates="sessions")
    resources: Mapped[list["SessionResource"]] = relationship(
        "SessionResource", back_populates="session", cascade="all, delete-orphan"
    )
    attendances: Mapped[list["Attendance"]] = relationship(
        "Attendance", back_populates="session", cascade="all, delete-orphan"
    )
    attendance_codes: Mapped[list["AttendanceCode"]] = relationship(
        "AttendanceCode", back_populates="session", cascade="all, delete-orphan"
    )


class SessionResource(Base):
    __tablename__ = "session_resources"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("sessions.id"))
    type: Mapped[ResourceType] = mapped_column(Enum(ResourceType))
    title: Mapped[str] = mapped_column(String(255))
    url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    # Speaker-specific fields
    speaker_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    speaker_bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    speaker_linkedin: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    # Relationships
    session: Mapped["Session"] = relationship("Session", back_populates="resources")
