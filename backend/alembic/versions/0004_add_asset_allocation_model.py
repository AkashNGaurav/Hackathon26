"""add asset allocation model

Revision ID: 0004_add_asset_allocation_model
Revises: 0003_add_user_model
Create Date: 2026-07-23 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0004_add_asset_allocation_model"
down_revision = "0003_add_user_model"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "asset_allocations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("asset_id", sa.UUID(), sa.ForeignKey("assets.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quantity", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("average_buy_price", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("invested_amount", sa.Numeric(precision=18, scale=4), nullable=False),
        sa.Column("current_value", sa.Numeric(precision=18, scale=4), nullable=True),
        sa.Column("purchase_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_asset_allocations_user_id", "asset_allocations", ["user_id"], unique=False)
    op.create_index("ix_asset_allocations_asset_id", "asset_allocations", ["asset_id"], unique=False)
    op.create_index("ix_user_asset", "asset_allocations", ["user_id", "asset_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_user_asset", table_name="asset_allocations")
    op.drop_index("ix_asset_allocations_asset_id", table_name="asset_allocations")
    op.drop_index("ix_asset_allocations_user_id", table_name="asset_allocations")
    op.drop_table("asset_allocations")
