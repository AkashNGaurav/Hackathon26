from sqlalchemy import Column, Integer, String, DateTime, Float, Text, Boolean
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    country = Column(String(100), nullable=True)
    kyc_completed = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)



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
