import csv
import io
from dataclasses import dataclass, field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.constants import UserRole
from app.core.exceptions import CSVImportError
from app.core.security import hash_password
from app.repositories.user_repo import UserRepository
from app.repositories.mentee_repo import MenteeRepository


@dataclass
class ImportResult:
    total: int = 0
    created: int = 0
    skipped: int = 0
    errors: list[str] = field(default_factory=list)


class CSVImportService:
    """Service for importing mentees from CSV files."""

    REQUIRED_COLUMNS = {"mentee_id", "name", "email", "track", "default_password"}

    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.mentee_repo = MenteeRepository(db)
        self.db = db

    async def import_mentees(self, file_content: bytes) -> ImportResult:
        """
        Import mentees from CSV content.
        Expected columns: mentee_id, name, email, track, default_password
        """
        try:
            text = file_content.decode("utf-8")
        except UnicodeDecodeError:
            text = file_content.decode("latin-1")

        reader = csv.DictReader(io.StringIO(text))

        if not reader.fieldnames:
            raise CSVImportError("CSV file is empty or has no header row")

        missing_columns = self.REQUIRED_COLUMNS - set(reader.fieldnames)
        if missing_columns:
            raise CSVImportError(
                f"CSV missing required columns: {', '.join(missing_columns)}"
            )

        result = ImportResult()

        for row in reader:
            result.total += 1
            error = await self._process_row(row, result.total)
            if error:
                result.errors.append(error)
                result.skipped += 1
            else:
                result.created += 1

        # Limit errors in result to first 10
        result.errors = result.errors[:10]

        return result

    async def _process_row(self, row: dict, row_num: int) -> str | None:
        """Process a single CSV row. Returns error message or None on success."""
        mentee_id = row["mentee_id"].strip()
        name = row["name"].strip()
        email = row["email"].strip().lower()
        track = row["track"].strip()
        password = row["default_password"].strip()

        # Validate required fields
        if not all([mentee_id, name, email, track, password]):
            return f"Row {row_num}: Missing required field(s)"

        # Check if email already exists
        existing_user = await self.user_repo.find_by_email(email)
        if existing_user:
            return f"Row {row_num}: Email {email} already exists"

        # Check if mentee_id already exists
        existing_mentee = await self.mentee_repo.find_by_mentee_id(mentee_id)
        if existing_mentee:
            return f"Row {row_num}: Mentee ID {mentee_id} already exists"

        try:
            # Create user
            user = await self.user_repo.create_user(
                email=email,
                password_hash=hash_password(password),
                role=UserRole.MENTEE,
                is_active=True,
                must_reset_password=True,
            )

            # Create mentee profile
            await self.mentee_repo.create_profile(
                user_id=user.id,
                mentee_id=mentee_id,
                full_name=name,
                track=track,
            )

            return None
        except Exception as e:
            return f"Row {row_num}: Error creating mentee - {str(e)}"
