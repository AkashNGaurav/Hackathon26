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


class UserWallet(Base):
    __tablename__ = "user_wallets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, default=1, index=True)
    balance = Column(Float, nullable=False, default=12450.0)
    currency = Column(String(10), nullable=False, default="EUR")
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class OrderRecord(Base):
    __tablename__ = "order_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, default=1, index=True)
    symbol = Column(String(50), nullable=False, index=True)
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(String(50), nullable=False) # Stock, ETF, Mutual Fund
    transaction_type = Column(String(20), nullable=False) # BUY, SELL
    order_type = Column(String(20), nullable=False, default="LUMP_SUM") # LUMP_SUM, SIP
    sip_frequency = Column(String(20), nullable=True) # monthly, quarterly, yearly
    quantity = Column(Float, nullable=False)
    price_per_unit = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(20), nullable=False, default="COMPLETED")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class PortfolioPosition(Base):
    __tablename__ = "portfolio_positions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True, default=1, index=True)
    symbol = Column(String(50), nullable=False, index=True)
    asset_name = Column(String(255), nullable=False)
    asset_type = Column(String(50), nullable=False) # Stock, ETF, Mutual Fund
    quantity = Column(Float, nullable=False, default=0.0)
    average_buy_price = Column(Float, nullable=False, default=0.0)
    total_invested = Column(Float, nullable=False, default=0.0)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)

