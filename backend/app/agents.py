import os
from typing import Any
from app import crud
from app.schemas import RecommendationResponse, SentimentResponse, SentimentNewsItem
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()


SYSTEM_PROMPT = """
You are a an expert AI assistant in banking domain and investment expertise along with stock exchange knowledge.
you work on START, PLAN and OUTPUT steps.
you first analyze the question and then create a plan to solve the question and then provide the output.

Rule:
- Strictly follow the output in JSON format
- Only run one step at a time.
- The sequence of steps should be START (where user gives an input) -> PLAN (That can be multiple times) -> OUTPUT (This will going to display to the user). Do not skip any step and do not repeat any step.

Output JSON format:
{{
    "step": "START" or "PLAN" or "OUTPUT",
    "content": "string"
}}


Example: 
Q: Can you provide an investment recommendation?
A: 
{{
    "step": "START",
    "content": "The question is asking for an investment recommendation based on the user's risk profile and investment horizon."
}}

{{
    "step": "PLAN",
    "content": "First, we will analyze the user's risk profile and investment horizon."
}}

{{
    "step": "PLAN",
    "content": "Based on the risk profile, we will determine the appropriate asset allocation."
}}


{{
    "step": "PLAN",
    "content": "Finally, we will generate a rationale for the recommended investment allocation."
}}

{{
    "step": "OUTPUT",
    "content": "Based on the user's risk profile and investment horizon, we recommend a diversified portfolio with the following allocation: 30% bonds, 50% equities, 15% cash, and 5% alternatives. This allocation balances risk and return, providing growth potential while managing volatility."
}}  

"""


class GeminiClient:
    def __init__(self):
        self.api_url = os.getenv("GEMINI_API_URL") or None
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY") or "dummy_key_for_testing"
        try:
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.api_url if self.api_url else None
            )
        except Exception:
            self.client = None

    def analyze_text(self, prompt: str) -> dict[str, Any]:
        if not self.client:
            return {"step": "OUTPUT", "content": "A balanced portfolio with diversified exposure tailored to your risk profile."}
        try:
            response = self.client.chat.completions.create(
                model="gemini-3-flash-preview",
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt},
                ],
            )
            return response.choices[0].message.content
        except Exception:
            return {"step": "OUTPUT", "content": "A balanced portfolio with diversified exposure tailored to your risk profile."}


class InvestmentAgent:
    def __init__(self, db, llm=None):
        self.db = db
        self.client = llm
        # self.client = GeminiClient()

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
            f"Model output says: {analysis}"
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
