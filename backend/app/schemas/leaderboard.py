from pydantic import BaseModel

from app.services.scoring_service import LeaderboardEntry


class LeaderboardEntryResponse(BaseModel):
    rank: int
    mentee_profile_id: int
    mentee_id: str
    full_name: str
    track: str
    sessions_attended: int
    total_core_sessions: int
    meet_score: float
    telegram_messages: int
    telegram_score: float
    total_score: float

    @classmethod
    def from_entry(cls, entry: LeaderboardEntry) -> "LeaderboardEntryResponse":
        return cls(
            rank=entry.rank,
            mentee_profile_id=entry.mentee_id,
            mentee_id=entry.mentee_program_id,
            full_name=entry.full_name,
            track=entry.track,
            sessions_attended=entry.sessions_attended,
            total_core_sessions=entry.total_core_sessions,
            meet_score=entry.meet_score,
            telegram_messages=entry.telegram_messages,
            telegram_score=entry.telegram_score,
            total_score=entry.total_score,
        )
