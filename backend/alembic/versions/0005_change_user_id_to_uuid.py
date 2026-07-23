"""change user id to uuid

Revision ID: 0005_change_user_id_to_uuid
Revises: 0004_add_asset_allocation_model
Create Date: 2026-07-23 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0005_change_user_id_to_uuid"
down_revision = "0004_add_asset_allocation_model"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Re-create users table with UUID primary key
    op.drop_table("asset_allocations")
    op.drop_table("users")

    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("username", sa.String(length=100), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("kyc_completed", sa.Boolean(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "asset_allocations",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True, nullable=False),
        sa.Column("user_id", sa.UUID(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
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
    op.drop_table("asset_allocations")
    op.drop_table("users")
