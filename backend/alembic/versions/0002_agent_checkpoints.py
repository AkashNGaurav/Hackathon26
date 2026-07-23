"""add persisted agent checkpoints

Revision ID: 0002_agent_checkpoints
Revises: 0001_init
Create Date: 2026-07-23 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_agent_checkpoints"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "agent_checkpoints",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("session_id", sa.String(length=64), nullable=False),
        sa.Column("agent_type", sa.String(length=32), nullable=False),
        sa.Column("role", sa.String(length=16), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_agent_checkpoints_session_id", "agent_checkpoints", ["session_id"])
    op.create_index("ix_agent_checkpoints_agent_type", "agent_checkpoints", ["agent_type"])
    op.create_index("ix_agent_checkpoints_created_at", "agent_checkpoints", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_agent_checkpoints_created_at", table_name="agent_checkpoints")
    op.drop_index("ix_agent_checkpoints_agent_type", table_name="agent_checkpoints")
    op.drop_index("ix_agent_checkpoints_session_id", table_name="agent_checkpoints")
    op.drop_table("agent_checkpoints")
