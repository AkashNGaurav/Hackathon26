import os
from typing import Any
from app import crud
from app.schemas import RecommendationResponse, SentimentResponse, SentimentNewsItem


class GeminiClient:
    def __init__(self):
        self.api_url = os.getenv("GEMINI_API_URL", "")
        self.api_key = os.getenv("GEMINI_API_KEY", "")

    def analyze_text(self, prompt: str) -> dict[str, Any]:
        # Placeholder for Gemini or compatible model call
        return {"output": "This is a simulated Gemini analysis."}


class InvestmentAgent:
    def __init__(self, db):
        self.db = db
        self.client = GeminiClient()

    def recommend(self, risk_profile: str, investment_horizon: int) -> RecommendationResponse:
        allocation = self._allocation_for_profile(risk_profile)
        rationale = self._generate_rationale(risk_profile, investment_horizon)
        return RecommendationResponse(
            risk_profile=risk_profile,
            investment_horizon=investment_horizon,
            recommended_allocation=allocation,
            rationale=rationale,
        )

    def _allocation_for_profile(self, risk_profile: str) -> dict[str, float]:
        if risk_profile == "low":
            return {"bonds": 55.0, "equities": 25.0, "cash": 15.0, "alternatives": 5.0}
        if risk_profile == "high":
            return {"bonds": 15.0, "equities": 65.0, "cash": 10.0, "alternatives": 10.0}
        return {"bonds": 30.0, "equities": 50.0, "cash": 15.0, "alternatives": 5.0}

    def _generate_rationale(self, risk_profile: str, investment_horizon: int) -> str:
        prompt = (
            f"Provide an investment rationale for a {risk_profile} investor"
            f" with a {investment_horizon}-year horizon in Europe."
        )
        analysis = self.client.analyze_text(prompt)
        return (
            f"A balanced portfolio with diversified exposure. "
            f"Model output says: {analysis['output']}"
        )


class SentimentAgent:
    def __init__(self, db):
        self.db = db
        self.client = GeminiClient()

    def analyze_market_sentiment(self) -> SentimentResponse:
        from app import models

        news_items = crud.list_market_news(self.db)
        if not news_items:
            return SentimentResponse(
                overall_sentiment="neutral",
                confidence=0.55,
                news_insights=[],
            )

        sentiment_scores = {"positive": 0, "neutral": 0, "negative": 0}
        insights = []
        for item in news_items:
            sentiment_scores[item.sentiment] += 1
            insights.append(
                SentimentNewsItem(
                    title=item.title,
                    source=item.source,
                    sentiment=item.sentiment,
                    excerpt=item.excerpt or "",
                )
            )

        majority = max(sentiment_scores, key=sentiment_scores.get)
        confidence = round(sentiment_scores[majority] / max(1, len(news_items)), 2)
        return SentimentResponse(
            overall_sentiment=majority,
            confidence=confidence,
            news_insights=insights,
        )
