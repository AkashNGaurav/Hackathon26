"""add checkpoint session lookup index

Revision ID: 0003_checkpoint_lookup_index
Revises: 0002_agent_checkpoints
Create Date: 2026-07-23 00:00:00.000000
"""

from alembic import op


revision = "0003_checkpoint_lookup_index"
down_revision = "0002_agent_checkpoints"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index(
        "ix_agent_checkpoints_session_agent_created",
        "agent_checkpoints",
        ["session_id", "agent_type", "created_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_agent_checkpoints_session_agent_created", table_name="agent_checkpoints")
