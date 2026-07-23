"""add asset model

Revision ID: 0002_add_asset_model
Revises: 0001_init
Create Date: 2026-07-23 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa

revision = "0002_add_asset_model"
down_revision = "0001_init"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "assets",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("asset_code", sa.String(length=50), nullable=False),
        sa.Column("asset_name", sa.String(length=255), nullable=False),
        sa.Column(
            "asset_type",
            sa.Enum("STOCKS", "MUTUAL_FUNDS", "FIXED_DEPOSITS", "BONDS", "ETFS", "GOLD", "CASH", name="asset_type_enum"),
            nullable=False,
        ),
        sa.Column("issuer", sa.String(length=255), nullable=True),
        sa.Column("symbol", sa.String(length=50), nullable=True),
        sa.Column("exchange", sa.String(length=50), nullable=True),
        sa.Column("currency", sa.String(length=10), nullable=False, server_default="USD"),
        sa.Column("current_price", sa.Numeric(precision=18, scale=4), nullable=True),
        sa.Column(
            "risk_level",
            sa.Enum("LOW", "MODERATE", "HIGH", "VERY_HIGH", name="risk_level_enum"),
            nullable=False,
            server_default="MODERATE",
        ),
        sa.Column("logo_url", sa.String(length=500), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_assets_asset_code", "assets", ["asset_code"], unique=True)
    op.create_index("ix_assets_asset_type", "assets", ["asset_type"], unique=False)
    op.create_index("ix_assets_symbol", "assets", ["symbol"], unique=False)
    op.create_index("ix_assets_is_active", "assets", ["is_active"], unique=False)
    op.create_index("ix_assets_type_active", "assets", ["asset_type", "is_active"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_assets_type_active", table_name="assets")
    op.drop_index("ix_assets_is_active", table_name="assets")
    op.drop_index("ix_assets_symbol", table_name="assets")
    op.drop_index("ix_assets_asset_type", table_name="assets")
    op.drop_index("ix_assets_asset_code", table_name="assets")
    op.drop_table("assets")
