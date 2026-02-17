"""add_absent_to_attendance_status

Revision ID: c2c79702193e
Revises: 782549d6c9b9
Create Date: 2026-02-17 16:30:05.397423

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c2c79702193e'
down_revision: Union[str, None] = '782549d6c9b9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add ABSENT to the attendancestatus enum
    op.execute("ALTER TYPE attendancestatus ADD VALUE IF NOT EXISTS 'ABSENT'")


def downgrade() -> None:
    # PostgreSQL doesn't support removing enum values easily
    # This would require recreating the type, which is complex
    pass
