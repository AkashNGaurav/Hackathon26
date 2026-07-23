from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, Literal


class UserRegister(BaseModel):
    email: str
    username: str
    password: str
    country: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    country: Optional[str] = None
    kyc_completed: bool

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[int] = None


class KYCUpdateSchema(BaseModel):
    kyc_completed: bool = True


class KYCUpdateResponse(UserResponse):
    message: str = "KYC status updated successfully"



class ExpenseEntryBase(BaseModel):
    category: str = Field(..., example="Investment")
    amount: float = Field(..., example=1200.50)
    currency: str = Field("EUR", example="EUR")
    description: Optional[str] = Field(None, example="Monthly stock purchase")


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


