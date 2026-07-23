from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from fastapi.params import Query


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


class LLMConfig:

    def __init__(self, model: str = Query("gemini=3.5-flash", alias="modelName", description="name of LLM model"),
    temperature: float = Query(0, ge=0, le=1, description="Sampling temperature"),
                 max_tokens: Optional[int] = Query(None, alias="maxTokens", ge=1, description="MAx number of token for LLM Reponse"),
                 max_retries: int = Query(6, alias="maxRetries", ge=0, description="Max number of retries for the LLM call")):

        self.model = model,
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.max_retries  = max_retries