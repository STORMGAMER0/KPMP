"""add telegram_username to mentee_profile

Revision ID: a3d8f2e1b5c4
Revises: c2c79702193e
Create Date: 2024-01-15 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3d8f2e1b5c4'
down_revision: Union[str, None] = 'c2c79702193e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Step 1: Add column as nullable first
    op.add_column(
        'mentee_profiles',
        sa.Column('telegram_username', sa.String(100), nullable=True)
    )

    # Step 2: Update existing records with placeholder usernames based on mentee_id
    # This ensures existing records have a value before we make the column NOT NULL
    op.execute("""
        UPDATE mentee_profiles
        SET telegram_username = CONCAT('pending_', mentee_id)
        WHERE telegram_username IS NULL
    """)

    # Step 3: Make the column NOT NULL
    op.alter_column(
        'mentee_profiles',
        'telegram_username',
        nullable=False
    )

    # Step 4: Add index for faster lookups
    op.create_index(
        'ix_mentee_profiles_telegram_username',
        'mentee_profiles',
        ['telegram_username']
    )


def downgrade() -> None:
    op.drop_index('ix_mentee_profiles_telegram_username', table_name='mentee_profiles')
    op.drop_column('mentee_profiles', 'telegram_username')
