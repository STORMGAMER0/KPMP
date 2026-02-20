from datetime import datetime
from sqlalchemy import String, BigInteger, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class MenteeProfile(Base):
    __tablename__ = "mentee_profiles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)
    mentee_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)  # e.g., KPDF-001
    full_name: Mapped[str] = mapped_column(String(255))
    track: Mapped[str] = mapped_column(String(100))
    profile_pic_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    telegram_username: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    telegram_user_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="mentee_profile")
    attendances: Mapped[list["Attendance"]] = relationship(
        "Attendance", back_populates="mentee"
    )
    telegram_stats: Mapped[list["TelegramStat"]] = relationship(
        "TelegramStat", back_populates="mentee"
    )
