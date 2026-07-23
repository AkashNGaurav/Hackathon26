from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


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


# --- User & Auth Schemas ---

class UserRegisterRequest(BaseModel):
    email: str = Field(..., example="user@example.com")
    username: str = Field(..., example="finsight_user")
    password: str = Field(..., example="StrongPassword123!")
    country: Optional[str] = Field(None, example="Germany")


class UserLoginRequest(BaseModel):
    username: str = Field(..., example="finsight_user")
    password: str = Field(..., example="StrongPassword123!")


class UserResponse(BaseModel):
    id: int
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
    user_id: int
    email: str
    exp: Optional[int] = None
    iat: Optional[int] = None

