from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Index
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()


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
    title = Column(String(300), nullable=False)
    source = Column(String(150), nullable=False)
    sentiment = Column(String(50), nullable=False)
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
