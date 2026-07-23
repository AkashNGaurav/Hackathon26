import uuid
import enum
from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean, Enum, ForeignKey, Numeric
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.sqlite import CHAR
from sqlalchemy.types import TypeDecorator
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Float,
    Text,
    Numeric,
    Boolean,
    Enum as SQLEnum,
    Index,
    ForeignKey,
    func,
)
from sqlalchemy.types import UUID
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship

Base = declarative_base()



class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    country = Column(String(100), nullable=True)
    kyc_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)



class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses CHAR(36) in SQLite/MySQL, storing stringified UUIDs.
    """
    impl = CHAR(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif isinstance(value, uuid.UUID):
            return str(value)
        else:
            return str(uuid.UUID(value))

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(value)
            return value


class AssetType(str, enum.Enum):
    STOCKS = "STOCKS"
    MUTUAL_FUNDS = "MUTUAL_FUNDS"
    ETFS = "ETFS"
    BONDS = "BONDS"
    CRYPTO = "CRYPTO"
    REAL_ESTATE = "REAL_ESTATE"
    COMMODITIES = "COMMODITIES"
    CASH_EQUIVALENT = "CASH_EQUIVALENT"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"


class User(Base):
    __tablename__ = "users"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    country = Column(String(100), nullable=True)
    kyc_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    asset_allocations = relationship("AssetAllocation", back_populates="user", cascade="all, delete-orphan")


class Asset(Base):
    __tablename__ = "assets"

    id = Column(GUID(), primary_key=True, default=uuid.uuid4)
    asset_code = Column(String(50), unique=True, nullable=False, index=True)
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(Enum(AssetType), nullable=False, index=True)
    issuer = Column(String(255), nullable=True)
    symbol = Column(String(50), nullable=True)
    exchange = Column(String(50), nullable=True)
    currency = Column(String(10), nullable=False, default="USD")
    current_price = Column(Numeric(18, 4), nullable=True)
    risk_level = Column(Enum(RiskLevel), nullable=False, default=RiskLevel.MODERATE)
    logo_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    asset_allocations = relationship("AssetAllocation", back_populates="asset", cascade="all, delete-orphan")


class AssetAllocation(Base):
    __tablename__ = "asset_allocations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(GUID(), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_id = Column(GUID(), ForeignKey("assets.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Numeric(18, 4), nullable=False)
    average_buy_price = Column(Numeric(18, 4), nullable=False)
    invested_amount = Column(Numeric(18, 4), nullable=False)
    current_value = Column(Numeric(18, 4), nullable=True)
    purchase_date = Column(DateTime, nullable=True, default=datetime.utcnow)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="asset_allocations")
    asset = relationship("Asset", back_populates="asset_allocations")


class ExpenseEntry(Base):
    __tablename__ = "expense_entries"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False, default="EUR")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class MarketNews(Base):
    __tablename__ = "market_news"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    source = Column(String(100), nullable=False)
    sentiment = Column(String(20), nullable=False)
    excerpt = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class AgentCheckpoint(Base):
    """A persisted chat turn used to restore an agent's conversation context."""

    __tablename__ = "agent_checkpoints"
    __table_args__ = (
        Index("ix_agent_checkpoints_session_agent_created", "session_id", "agent_type", "created_at"),
    )

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(64), nullable=False, index=True)
    agent_type = Column(String(32), nullable=False, index=True)
    role = Column(String(16), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
# --- Enums for Asset Model ---

class AssetType(str, enum.Enum):
    STOCKS = "STOCKS"
    MUTUAL_FUNDS = "MUTUAL_FUNDS"
    FIXED_DEPOSITS = "FIXED_DEPOSITS"
    BONDS = "BONDS"
    ETFS = "ETFS"
    GOLD = "GOLD"
    CASH = "CASH"


class RiskLevel(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    VERY_HIGH = "VERY_HIGH"


# --- Asset Master Table Model ---

class Asset(Base):
    """
    Master reference model for financial assets available in the system.
    Stores generic, common attributes across all investment instrument types.
    """
    __tablename__ = "assets"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Unique identifier (UUID v4) for the asset"
    )
    asset_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique internal asset code or ticker identification"
    )
    asset_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Full human-readable display name of the asset"
    )
    asset_type: Mapped[AssetType] = mapped_column(
        SQLEnum(AssetType, name="asset_type_enum"),
        nullable=False,
        index=True,
        comment="Classification category of the asset"
    )
    issuer: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Entity or organization issuing the asset (e.g. Bank, Government, Corporation)"
    )
    symbol: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        index=True,
        comment="Trading symbol / ticker code (e.g. AAPL, RELIANCE)"
    )
    exchange: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Stock exchange or market where traded (e.g. NYSE, NASDAQ, NSE)"
    )
    currency: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="USD",
        comment="Base currency code ISO 4217 (e.g. USD, EUR, INR)"
    )
    current_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(18, 4),
        nullable=True,
        comment="Latest market price or NAV per unit"
    )
    risk_level: Mapped[RiskLevel] = mapped_column(
        SQLEnum(RiskLevel, name="risk_level_enum"),
        nullable=False,
        default=RiskLevel.MODERATE,
        comment="Assigned risk profile level"
    )
    logo_url: Mapped[Optional[str]] = mapped_column(
        String(500),
        nullable=True,
        comment="URL link to the asset or company logo icon"
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        index=True,
        comment="Flag indicating if instrument is active for portfolio selection"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="Timestamp when record was created"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="Timestamp when record was last updated"
    )

    asset_allocations: Mapped[list["AssetAllocation"]] = relationship("AssetAllocation", back_populates="asset", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_assets_type_active", "asset_type", "is_active"),
    )


# --- User Model ---

class User(Base):
    """
    User account model for authentication, profile management, and KYC verification status.
    """
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        comment="Unique identifier (UUID v4) for the user"
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="User unique email address"
    )
    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
        comment="User unique username"
    )
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Hashed password"
    )
    country: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Country of residence"
    )
    kyc_completed: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Flag indicating whether KYC verification is completed"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        comment="Timestamp when user record was created"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
        comment="Timestamp when user record was last updated"
    )

    asset_allocations: Mapped[list["AssetAllocation"]] = relationship("AssetAllocation", back_populates="user", cascade="all, delete-orphan")


# --- Asset Allocation Model ---

class AssetAllocation(Base):
    """
    Represents a user's investment holding in a particular asset.
    Maps Users to Assets.
    """

    __tablename__ = "asset_allocations"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Owner of the investment"
    )

    asset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Reference to master asset"
    )

    quantity: Mapped[Decimal] = mapped_column(
        Numeric(18, 4),
        nullable=False,
        comment="Number of units purchased"
    )

    average_buy_price: Mapped[Decimal] = mapped_column(
        Numeric(18, 4),
        nullable=False,
        comment="Average purchase price per unit"
    )

    invested_amount: Mapped[Decimal] = mapped_column(
        Numeric(18, 4),
        nullable=False,
        comment="Total invested amount"
    )

    current_value: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(18, 4),
        nullable=True,
        comment="Current market value"
    )

    purchase_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Date when investment was made"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now()
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now()
    )

    user = relationship("User", back_populates="asset_allocations")
    asset = relationship("Asset", back_populates="asset_allocations")

    __table_args__ = (
        Index("ix_user_asset", "user_id", "asset_id"),
    )






class UserWallet(Base):
    __tablename__ = "user_wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, default=1, index=True)
    balance = Column(Float, nullable=False, default=12450.0)
    currency = Column(String(10), nullable=False, default="EUR")
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class OrderRecord(Base):
    __tablename__ = "order_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, default=1, index=True)
    symbol = Column(String(50), nullable=False, index=True)
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(String(50), nullable=False) # Stock, ETF, Mutual Fund
    transaction_type = Column(String(20), nullable=False) # BUY, SELL
    order_type = Column(String(20), nullable=False, default="LUMP_SUM") # LUMP_SUM, SIP
    sip_frequency = Column(String(20), nullable=True) # monthly, quarterly, yearly
    quantity = Column(Float, nullable=False)
    price_per_unit = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="COMPLETED")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class PortfolioPosition(Base):
    __tablename__ = "portfolio_positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, default=1, index=True)
    symbol = Column(String(50), nullable=False, index=True)
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(String(50), nullable=False) # Stock, ETF, Mutual Fund
    quantity = Column(Float, nullable=False, default=0.0)
    average_buy_price = Column(Float, nullable=False, default=0.0)
    total_invested = Column(Float, nullable=False, default=0.0)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

