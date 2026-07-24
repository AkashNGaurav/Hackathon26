import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, Literal
from fastapi.params import Query
from pydantic import BaseModel, Field, EmailStr
from app.models import AssetType, RiskLevel


class UserRegister(BaseModel):
    email: str
    username: str
    password: str
    country: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    country: Optional[str] = None
    kyc_completed: bool = False

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[uuid.UUID] = None


class KYCUpdateSchema(BaseModel):
    kyc_completed: bool = True

class KYCUpdateResponse(UserResponse):
    message: str = "KYC status updated successfully"


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

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000, examples=["How should I invest for five years?"])
    session_id: Optional[str] = Field(None, min_length=1, max_length=64, examples=["c0a801f3-8a07-4f72-8e72-928d36e389e2"])


class ChatResponse(BaseModel):
    reply: str
    step: str = "OUTPUT"
    session_id: str
    agent: Literal["mutual_fund", "etf", "stock", "investment_advisor"]

class LLMConfig:

    def __init__(
        self,
        model: str = Query("gemini=3.5-flash", alias="modelName", description="name of LLM model"),
        temperature: float = Query(0, ge=0, le=1, description="Sampling temperature"),
        max_tokens: Optional[int] = Query(None, alias="maxTokens", ge=1, description="MAx number of token for LLM Reponse"),
        max_retries: int = Query(6, alias="maxRetries", ge=0, description="Max number of retries for the LLM call"),
    ):
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.max_retries = max_retries


# --- User & Auth Schemas ---

class UserRegisterRequest(BaseModel):
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$", example="user@example.com", description="Valid email address")
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$", example="finsight_user", description="Alphanumeric username, 3-50 chars")
    password: str = Field(..., min_length=6, max_length=100, example="StrongPassword123!", description="Password minimum 6 characters")
    country: Optional[str] = Field(None, max_length=100, example="Germany")


class UserLoginRequest(BaseModel):
    username: str = Field(..., min_length=1, example="finsight_user")
    password: str = Field(..., min_length=1, example="StrongPassword123!")


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


# --- Market Data & AI Schemas (from dashboard-added) ---

class AssetDataResponse(BaseModel):
    symbol: str
    name: str
    asset_type: str = "Stock"  # "Stock", "ETF", "Mutual Fund"
    exchange: str = "EURONEXT"
    currency: str = "EUR"
    current_price: float
    nav: Optional[float] = None
    previous_close: Optional[float] = None
    day_high: Optional[float] = None
    day_low: Optional[float] = None
    volume: Optional[int] = None
    price_change: float
    percentage_change: float
    is_positive: bool
    market_status: str = "OPEN"


class AssetHistoryData(BaseModel):
    date: str
    price: float


class AssetProfileData(BaseModel):
    sector: Optional[str] = None
    industry: Optional[str] = None
    website: Optional[str] = None
    market_cap: Optional[int] = None
    business_summary: Optional[str] = None
    total_assets: Optional[int] = None
    yield_pct: Optional[float] = None
    ytd_return: Optional[float] = None
    category: Optional[str] = None
    fund_family: Optional[str] = None


class MarketNewsArticle(BaseModel):
    id: str
    title: str
    snippet: str
    category: str
    source: str
    publishedAt: str
    readTime: str
    relatedTickers: list[str]
    link: Optional[str] = None


class AIRecommendRequest(BaseModel):
    symbols: list[str] = Field(default_factory=lambda: ["MC.PA", "VW.DE", "VUAA.L", "ASML.AS"])
    risk_profile: str = Field("moderate", example="moderate")


class AIRecommendResponse(BaseModel):
    recommended_symbol: str
    recommended_name: str
    recommendation_summary: str
    analysis_details: list[str]
    risk_profile: str


class WalletResponse(BaseModel):
    id: int
    user_id: Optional[int] = 1
    balance: float
    currency: str
    updated_at: datetime

    class Config:
        from_attributes = True


class WalletDepositRequest(BaseModel):
    amount: float = Field(..., gt=0)


class OrderRequest(BaseModel):
    symbol: str
    asset_name: str
    asset_type: str  # Stock, ETF, Mutual Fund
    transaction_type: str  # BUY, SELL
    order_type: str = "LUMP_SUM"  # LUMP_SUM, SIP
    sip_frequency: Optional[str] = None  # monthly, quarterly, yearly
    quantity: float
    price_per_unit: float


class OrderResponse(BaseModel):
    id: int
    user_id: Optional[int] = 1
    symbol: str
    asset_name: str
    asset_type: str
    transaction_type: str
    order_type: str
    sip_frequency: Optional[str] = None
    quantity: float
    price_per_unit: float
    total_amount: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioPositionResponse(BaseModel):
    id: int
    symbol: str
    asset_name: str
    asset_type: str
    quantity: float
    average_buy_price: float
    total_invested: float
    current_price: Optional[float] = None
    current_value: Optional[float] = None
    unrealized_pnl: Optional[float] = None
    unrealized_pnl_pct: Optional[float] = None
    price_change: Optional[float] = 0.0
    percentage_change: Optional[float] = 0.0
    is_positive: Optional[bool] = True
    market_status: Optional[str] = "OPEN"
    currency: Optional[str] = "EUR"
    updated_at: datetime

    class Config:
        from_attributes = True


class MFRecommendRequest(BaseModel):
    goal: str = Field("custom", example="home")  # home, education, retirement, custom
    custom_goal_title: Optional[str] = None
    target_amount: float = Field(50000.0, example=50000.0)
    target_years: int = Field(5, example=5)
    risk_profile: str = Field("moderate", example="moderate")  # conservative, moderate, aggressive


class MFRecommendItem(BaseModel):
    symbol: str
    name: str
    nav_price: float
    percentage_change: float
    is_positive: bool
    recommended_sip_amount: float
    expected_annual_return: float
    target_years: int
    projected_target_value: float
    ai_rationale: str
    match_score: int


class MFRecommendResponse(BaseModel):
    goal: str
    custom_goal_title: Optional[str] = None
    risk_profile: str
    target_amount: float
    target_years: int
    goal_title: str
    recommendations: list[MFRecommendItem]




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
