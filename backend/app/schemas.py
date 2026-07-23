import uuid
from decimal import Decimal
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from app.models import AssetType, RiskLevel


class ExpenseEntryBase(BaseModel):
    category: str = Field(..., min_length=1, max_length=100, example="Investment")
    amount: float = Field(..., gt=0, example=1200.50, description="Amount must be greater than 0")
    currency: str = Field("EUR", min_length=3, max_length=3, pattern=r"^[A-Z]{3}$", example="EUR", description="ISO 4217 currency code")
    description: Optional[str] = Field(None, max_length=500, example="Monthly stock purchase")


class ExpenseEntryCreate(ExpenseEntryBase):
    pass


class ExpenseEntryResponse(ExpenseEntryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class RecommendationResponse(BaseModel):
    risk_profile: str
    investment_horizon: int
    recommended_allocation: dict[str, float]
    rationale: str


class SentimentNewsItem(BaseModel):
    title: str
    source: str
    sentiment: str
    excerpt: str


class SentimentResponse(BaseModel):
    overall_sentiment: str
    confidence: float
    news_insights: list[SentimentNewsItem]


# --- User & Auth Schemas ---

class UserRegisterRequest(BaseModel):
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", example="user@example.com", description="Valid email address")

    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$", example="finsight_user", description="Alphanumeric username, 3-50 chars")
    password: str = Field(..., min_length=6, max_length=100, example="StrongPassword123!", description="Password minimum 6 characters")
    country: Optional[str] = Field(None, max_length=100, example="Germany")


class UserLoginRequest(BaseModel):
    username: str = Field(..., min_length=1, example="finsight_user")
    password: str = Field(..., min_length=1, example="StrongPassword123!")


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    country: Optional[str] = None
    kyc_completed: bool = False

    class Config:
        from_attributes = True


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class KYCUpdateRequest(BaseModel):
    kyc_completed: bool


class KYCUpdateResponse(UserResponse):
    message: str = "KYC status updated successfully"


class JWTClaimsPayload(BaseModel):
    sub: str
    user_id: uuid.UUID
    email: str
    exp: Optional[int] = None
    iat: Optional[int] = None


# --- Asset Schemas ---

class AssetBase(BaseModel):
    asset_code: str = Field(..., min_length=2, max_length=50, pattern=r"^[A-Za-z0-9_.-]+$", example="AAPL_US", description="Unique internal asset code")
    asset_name: str = Field(..., min_length=1, max_length=255, example="Apple Inc.", description="Full human-readable display name")
    asset_type: AssetType = Field(..., example=AssetType.STOCKS, description="Classification category of the asset")
    issuer: Optional[str] = Field(None, max_length=255, example="Apple Inc.")
    symbol: Optional[str] = Field(None, max_length=50, example="AAPL")
    exchange: Optional[str] = Field(None, max_length=50, example="NASDAQ")
    currency: str = Field("USD", min_length=3, max_length=3, pattern=r"^[A-Z]{3}$", example="USD", description="ISO 4217 currency code")
    current_price: Optional[Decimal] = Field(None, ge=0, example="185.5000", description="Latest market price or NAV per unit")
    risk_level: RiskLevel = Field(RiskLevel.MODERATE, example=RiskLevel.MODERATE, description="Assigned risk profile level")
    logo_url: Optional[str] = Field(None, max_length=500, example="https://example.com/logo.png")
    is_active: bool = Field(True, description="Flag indicating if instrument is active")


class AssetCreate(AssetBase):
    pass


class AssetUpdate(BaseModel):
    asset_code: Optional[str] = Field(None, min_length=2, max_length=50, pattern=r"^[A-Za-z0-9_.-]+$")
    asset_name: Optional[str] = Field(None, min_length=1, max_length=255)
    asset_type: Optional[AssetType] = None
    issuer: Optional[str] = Field(None, max_length=255)
    symbol: Optional[str] = Field(None, max_length=50)
    exchange: Optional[str] = Field(None, max_length=50)
    currency: Optional[str] = Field(None, min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    current_price: Optional[Decimal] = Field(None, ge=0)
    risk_level: Optional[RiskLevel] = None
    logo_url: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class AssetResponse(AssetBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Asset Allocation Schemas ---

class AssetAllocationBase(BaseModel):
    user_id: uuid.UUID = Field(..., example="c56a4180-65aa-42ec-a945-5fd21dec0538", description="Owner user UUID")
    asset_id: uuid.UUID = Field(..., example="d89fa088-8a54-49fa-a0ee-0c27bacc7bca", description="Reference to master asset UUID")
    quantity: Decimal = Field(..., gt=0, example="10.0000", description="Number of units purchased (must be > 0)")
    average_buy_price: Decimal = Field(..., gt=0, example="150.0000", description="Average purchase price per unit (must be > 0)")
    invested_amount: Optional[Decimal] = Field(None, ge=0, example="1500.0000", description="Total invested amount (auto-calculated if omitted)")
    current_value: Optional[Decimal] = Field(None, ge=0, example="1600.0000", description="Current market value")
    purchase_date: Optional[datetime] = Field(None, example="2026-07-23T00:00:00Z", description="Timestamp when investment was made")


class AssetAllocationCreate(AssetAllocationBase):
    pass


class AssetAllocationResponse(AssetAllocationBase):
    id: int
    invested_amount: Decimal
    created_at: datetime
    updated_at: datetime
    asset: Optional[AssetResponse] = Field(None, description="Full details of the associated asset")

    class Config:
        from_attributes = True





