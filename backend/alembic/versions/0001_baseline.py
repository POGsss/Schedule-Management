"""Create baseline application metadata."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001_baseline"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Create the initial schema used to establish migration readiness."""
    op.create_table(
        "app_metadata",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("application_name", sa.String(length=100), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.bulk_insert(
        sa.table(
            "app_metadata",
            sa.column("id", sa.Integer()),
            sa.column("application_name", sa.String()),
        ),
        [{"id": 1, "application_name": "School Schedule Management"}],
    )


def downgrade() -> None:
    """Remove the baseline metadata table."""
    op.drop_table("app_metadata")
