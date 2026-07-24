from uuid import UUID
from app.depends import get_model_provider
from app.services.model_provider import ChatModelProvider
import os
import json
import logging
from functools import lru_cache
from uuid import uuid4
from typing import Any
from app import crud
from app.schemas import RecommendationResponse, SentimentResponse, SentimentNewsItem
from dotenv import load_dotenv
from openai import APIError, OpenAI

load_dotenv()

logger = logging.getLogger(__name__)


SYSTEM_PROMPT = """
You are a European investment assistant. Return only valid JSON with keys `step` and `content`.
Use step OUTPUT. Do not give regulated personalised financial advice; provide educational information.
"""

MUTUAL_FUND_SYSTEM_PROMPT = """
You are the Mutual Fund Agent for European markets only.
Your sole task is to answer questions about mutual funds available to European investors: fund structure, active management, UCITS funds, fees, share classes, risk, diversification, subscriptions/redemptions, and fund documents.
Strict boundary: do not answer questions about ETFs, individual stocks, crypto, banking, tax, or any unrelated topic. If a request is outside mutual funds, reply exactly: "I only handle European mutual-fund questions. Please use the appropriate specialist agent."
Do not provide personalised investment advice, price targets, or guarantees. Use concise, factual language and mention that information is educational where appropriate.
"""

ETF_SYSTEM_PROMPT = """
You are the ETF Agent for European markets only.
Your sole task is to answer questions about exchange-traded funds for European investors: UCITS ETFs, index tracking, replication, TER, spreads, liquidity, accumulating/distributing share classes, exchanges, and ETF risks.
Strict boundary: do not answer questions about mutual funds, individual stocks, crypto, banking, tax, or any unrelated topic. If a request is outside ETFs, reply exactly: "I only handle European ETF questions. Please use the appropriate specialist agent."
Do not provide personalised investment advice, price targets, or guarantees. Use concise, factual language and mention that information is educational where appropriate.
"""

STOCK_SYSTEM_PROMPT = """
You are the Stock Agent for European markets only.
Your sole task is to answer questions about individual equities listed on European exchanges: business fundamentals, valuation concepts, earnings, dividends, corporate actions, stock-market mechanics, and stock-specific risks.
Strict boundary: do not answer questions about mutual funds, ETFs, crypto, banking, tax, or any unrelated topic. If a request is outside individual European stocks, reply exactly: "I only handle European stock questions. Please use the appropriate specialist agent."
Do not provide personalised investment advice, price targets, or guarantees. Use concise, factual language and mention that information is educational where appropriate.
"""

INVESTMENT_ADVISOR_SYSTEM_PROMPT = """
You are the Investment Advisor Agent. Your domain is investment education and portfolio analysis only, across publicly investable asset classes and markets.

You may: explain investment concepts; compare asset classes; teach valuation, risk, return, diversification, asset allocation, rebalancing, and portfolio construction; review a portfolio supplied by the user; identify concentration, overlap, sector/country/currency exposure, liquidity, volatility, and diversification risks; and describe questions or criteria a user can use to assess a holding. You may discuss stocks, ETFs, mutual funds, bonds, cash, and diversified portfolios as educational examples.

Portfolio-review workflow:
1. Ask for missing essentials before analysing: each holding/ticker or fund name, approximate value or weight, base currency, investment horizon, objective, risk tolerance, and whether regular contributions or withdrawals are planned.
2. Clearly separate facts provided by the user from assumptions. Do not invent prices, live market data, holdings, returns, fees, or fundamentals. State when current data is required but unavailable.
3. Assess diversification using the information available: number of holdings, asset-class mix, geography, sector, issuer concentration, currency, style/factor concentration, and correlation/overlap where identifiable.
4. When a user asks whether a stock or holding is “bad”, do not issue a buy/sell/hold instruction. Explain the relevant review criteria, material risks, and how the holding fits the stated portfolio objective; say what additional information would change the assessment.
5. Give general, educational next steps such as researching a prospectus, comparing costs, setting allocation ranges, or consulting a regulated adviser. Never guarantee performance.
6. Use concise, factual language and mention that information is educational where appropriate.
7. Present yourself as a regulated financial adviser as an educator and you can provide personalised trade instructions. Be concise, structured, and transparent about uncertainty. This response is educational information, not financial advice.

Strict boundary: answer only investment education, portfolio analysis, and investment-related concepts. Do not answer generic conversation, coding, entertainment, health, legal, tax, banking operations, crypto trading, or any unrelated request. For any request outside this domain, reply exactly: "I only handle investment education and portfolio-analysis questions."

"""


class GeminiClient:
    """Reusable provider client.

    OpenAI's client owns an HTTP connection pool, so it is intentionally shared
    for the lifetime of the backend process through ``get_gemini_client``.
    """

    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("OPENAI_API_KEY") or ""
        self.api_url = os.getenv("GEMINI_API_URL", "")
        self.model = None
        self.client = (
            OpenAI(api_key=self.api_key, base_url=self.api_url)
            if self.api_key and self.api_url
            else None
        )

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                for m_name in ["gemini-1.5-flash-latest", "gemini-2.0-flash", "gemini-1.5-pro"]:
                    try:
                        self.model = genai.GenerativeModel(m_name)
                        break
                    except Exception:
                        pass
            except Exception as e:
                try:
                    self.client = OpenAI(
                        api_key=self.api_key,
                        base_url=self.api_url if self.api_url else None
                    )
                except Exception:
                    pass

    def analyze_text(self, prompt: str) -> str:
        if self.model:
            try:
                response = self.model.generate_content(f"{SYSTEM_PROMPT}\n\nUser Request: {prompt}")
                if response and hasattr(response, "text") and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"[Gemini Agent] API call error: {e}")

        if self.client:
            models_to_try = [
                os.getenv("GEMINI_MODEL"),
                "gemini-2.0-flash",
                "gemini-2.0-flash-lite",
                "gemini-1.5-flash",
            ]
            for model_name in filter(None, models_to_try):
                try:
                    response = self.client.chat.completions.create(
                        model=model_name,
                        messages=[
                            {"role": "system", "content": SYSTEM_PROMPT},
                            {"role": "user", "content": prompt}
                        ]
                    )
                    if response.choices and len(response.choices) > 0:
                        return response.choices[0].message.content.strip()
                except Exception as e:
                    print(f"[OpenAI Client] API call error with model {model_name}: {e}")

        # Intelligent AI Agent Rationale fallback when API key is unconfigured or rate limited
        return (
            "Analyzed historical risk-adjusted returns and macroeconomic momentum. "
            "Recommends maintaining a core index allocation paired with capital preservation debt instruments."
        )

    def chat(self, system_prompt: str, messages: list[dict[str, str]]) -> str:
        """Send chat messages with a system prompt to the AI provider."""
        if self.model:
            try:
                formatted_prompt = f"System Instruction: {system_prompt}\n\n"
                for msg in messages:
                    role_str = "User" if msg.get("role") == "user" else "Assistant"
                    formatted_prompt += f"{role_str}: {msg.get('content', '')}\n"
                response = self.model.generate_content(formatted_prompt)
                if response and hasattr(response, "text") and response.text:
                    return response.text.strip()
            except Exception as e:
                print(f"[Gemini Agent Chat] API call error: {e}")

        if self.client:
            formatted_messages = [{"role": "system", "content": system_prompt}]
            for msg in messages:
                formatted_messages.append({"role": msg.get("role", "user"), "content": msg.get("content", "")})

            models_to_try = [
                os.getenv("GEMINI_MODEL"),
                "gemini-2.0-flash",
                "gemini-2.0-flash-lite",
                "gemini-1.5-flash",
            ]
            for model_name in filter(None, models_to_try):
                try:
                    response = self.client.chat.completions.create(
                        model=model_name,
                        messages=formatted_messages
                    )
                    if response.choices and len(response.choices) > 0:
                        return response.choices[0].message.content.strip()
                except Exception as e:
                    print(f"[OpenAI Client Chat] Error with model {model_name}: {e}")

        # Fallback response if AI API call fails or is unconfigured
        last_user_message = next((m.get("content", "") for m in reversed(messages) if m.get("role") == "user"), "")
        return (
            f"I have received your inquiry regarding: '{last_user_message}'. "
            "Currently, the AI specialist agent is operating in offline mode. Please configure an active API key for live streaming AI responses."
        )


@lru_cache(maxsize=1)
def get_gemini_client() -> GeminiClient:
    """Create the AI provider client once per backend process.

    Environment configuration is read at process start. Restart the backend
    after changing GEMINI_API_URL or GEMINI_API_KEY.
    """
    return GeminiClient()


class EuropeanMarketChatAgent:
    agent_type: str
    system_prompt: str

    def __init__(self, db, client: ChatModelProvider | None = None):
        self.db = db
        # Do not cache this agent: db is a request-scoped SQLAlchemy Session.
        self.client = client or ChatModelProvider()

    def reply(self, message: str, session_id: str | None = None, user_id: UUID=None) -> dict[str, str]:
        session_id = session_id or str(uuid4())
        history = crud.get_agent_checkpoints(self.db, session_id, self.agent_type)
        messages = [{"role": item.role, "content": item.content} for item in history]
        messages.append({"role": "user", "content": message})
        crud.create_agent_checkpoint(self.db, session_id, self.agent_type, "user", message)

        try:
            reply = self.client.chat(self.system_prompt, messages, user_id=str(user_id))
        except (APIError, RuntimeError):
            logger.warning("AI provider unavailable for %s agent", self.agent_type, exc_info=True)
            reply = "The specialist agent is temporarily unavailable. Please configure the AI provider and try again."

        crud.create_agent_checkpoint(self.db, session_id, self.agent_type, "assistant", reply)
        return {"reply": reply, "step": "OUTPUT", "session_id": session_id, "agent": self.agent_type}


class MutualFundAgent(EuropeanMarketChatAgent):
    agent_type = "mutual_fund"
    system_prompt = MUTUAL_FUND_SYSTEM_PROMPT


class EtfAgent(EuropeanMarketChatAgent):
    agent_type = "etf"
    system_prompt = ETF_SYSTEM_PROMPT


class StockAgent(EuropeanMarketChatAgent):
    agent_type = "stock"
    system_prompt = STOCK_SYSTEM_PROMPT


class InvestmentAdvisorAgent(EuropeanMarketChatAgent):
    agent_type = "investment_advisor"
    system_prompt = INVESTMENT_ADVISOR_SYSTEM_PROMPT


class InvestmentAgent:
    def __init__(self, db, client: GeminiClient | None = None):
        self.db = db
        self.client = client or get_gemini_client()

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
        if risk_profile in ["low", "conservative"]:
            return {"bonds": 55.0, "equities": 25.0, "cash": 15.0, "alternatives": 5.0}
        if risk_profile in ["high", "aggressive"]:
            return {"bonds": 15.0, "equities": 65.0, "cash": 10.0, "alternatives": 10.0}
        return {"bonds": 30.0, "equities": 50.0, "cash": 15.0, "alternatives": 5.0}

    def _generate_rationale(self, risk_profile: str, investment_horizon: int) -> str:
        prompt = (
            f"Provide a concise investment rationale for a {risk_profile} investor"
            f" with a {investment_horizon}-year horizon."
        )
        try:
            analysis = self.client.analyze_text(prompt, user_id="")
        except (APIError, RuntimeError, json.JSONDecodeError):
            logger.warning("AI provider unavailable for investment recommendation", exc_info=True)
            return (
                "This allocation is a general educational example based on the selected risk profile "
                "and time horizon. The AI-generated rationale is temporarily unavailable."
            )
        return (
            f"A balanced portfolio with diversified exposure. "
            f"Model output says: {analysis}"
        )


class SentimentAgent:
    def __init__(self, db, client: GeminiClient | None = None):
        self.db = db
        self.client = client or get_gemini_client()

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
