from datetime import datetime
from sqlalchemy import String, BigInteger, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class TelegramStat(Base):
    __tablename__ = "telegram_stats"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    mentee_id: Mapped[int] = mapped_column(ForeignKey("mentee_profiles.id"), index=True)
    program_id: Mapped[int] = mapped_column(ForeignKey("programs.id"), index=True)
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Relationships
    mentee: Mapped["MenteeProfile"] = relationship("MenteeProfile", back_populates="telegram_stats")
    program: Mapped["Program"] = relationship("Program", back_populates="telegram_stats")


class UnmappedTelegramUser(Base):
    __tablename__ = "unmapped_telegram_users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    telegram_user_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True)
    username: Mapped[str | None] = mapped_column(String(255), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    chat_id: Mapped[int] = mapped_column(BigInteger)  # Track group ID
    first_seen_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    message_count: Mapped[int] = mapped_column(Integer, default=0)  # Track messages while unmapped
