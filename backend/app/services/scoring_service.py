from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import MEET_SCORE_WEIGHT, TELEGRAM_SCORE_WEIGHT
from app.core.exceptions import NotFoundError
from app.repositories.attendance_repo import AttendanceRepository
from app.repositories.telegram_repo import TelegramStatsRepository
from app.repositories.program_repo import ProgramRepository


@dataclass
class LeaderboardEntry:
    rank: int
    mentee_id: int
    mentee_program_id: str
    full_name: str
    track: str
    sessions_attended: int
    total_core_sessions: int
    meet_score: float
    telegram_messages: int
    telegram_score: float
    total_score: float


class ScoringService:
    def __init__(self, db: AsyncSession):
        self.attendance_repo = AttendanceRepository(db)
        self.telegram_repo = TelegramStatsRepository(db)
        self.program_repo = ProgramRepository(db)

    async def compute_leaderboard(
        self, program_id: int, track: str | None = None
    ) -> list[LeaderboardEntry]:
        """Compute leaderboard with attendance and Telegram scores."""
        program = await self.program_repo.find_by_id(program_id)
        if program is None:
            raise NotFoundError("Program", program_id)

        total_core = program.total_core_sessions
        target_messages = program.telegram_target_messages

        # Get attendance counts per mentee
        mentees = await self.attendance_repo.get_mentee_attendance_counts(
            program_id, track
        )

        # Get telegram stats
        telegram_stats = await self.telegram_repo.get_stats_by_program(
            program_id, track
        )
        telegram_map = {s.mentee_id: s.message_count for s in telegram_stats}

        entries = []
        for m in mentees:
            # Attendance score (80% weight)
            meet_score = (m["present_count"] / total_core) * 100 if total_core > 0 else 0

            # Telegram score (20% weight, capped at 100)
            messages = telegram_map.get(m["mentee_id"], 0)
            telegram_score = (
                min((messages / target_messages) * 100, 100)
                if target_messages > 0
                else 0
            )

            # Total weighted score
            total_score = (
                MEET_SCORE_WEIGHT * meet_score + TELEGRAM_SCORE_WEIGHT * telegram_score
            )

            entries.append(
                LeaderboardEntry(
                    rank=0,  # Will be set after sorting
                    mentee_id=m["mentee_id"],
                    mentee_program_id=m["mentee_program_id"],
                    full_name=m["full_name"],
                    track=m["track"],
                    sessions_attended=m["present_count"],
                    total_core_sessions=total_core,
                    meet_score=round(meet_score, 1),
                    telegram_messages=messages,
                    telegram_score=round(telegram_score, 1),
                    total_score=round(total_score, 1),
                )
            )

        # Sort by total score descending
        entries.sort(key=lambda e: e.total_score, reverse=True)

        # Assign ranks
        for rank, entry in enumerate(entries, 1):
            entry.rank = rank

        return entries
