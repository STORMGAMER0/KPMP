from enum import Enum


class UserRole(str, Enum):
    MENTEE = "MENTEE"
    COORDINATOR = "COORDINATOR"


class AttendanceStatus(str, Enum):
    NOT_JOINED = "NOT_JOINED"  # Legacy - kept for DB compatibility
    ABSENT = "ABSENT"
    PARTIAL = "PARTIAL"
    PRESENT = "PRESENT"


class ResourceType(str, Enum):
    SPEAKER = "SPEAKER"
    MATERIAL = "MATERIAL"
    LINK = "LINK"


# Scoring constants (defaults, can be overridden per program)
DEFAULT_TOTAL_CORE_SESSIONS = 16
DEFAULT_TELEGRAM_TARGET_MESSAGES = 50
MEET_SCORE_WEIGHT = 0.8
TELEGRAM_SCORE_WEIGHT = 0.2

# Attendance code settings
CODE_EXPIRATION_MINUTES = 20
CODE_PREFIX = "KPDF"
CODE_LENGTH = 4

# Message filtering
MIN_MESSAGE_LENGTH = 5
