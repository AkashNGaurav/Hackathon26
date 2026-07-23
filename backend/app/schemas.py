from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal, Optional


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
        orm_mode = True


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
