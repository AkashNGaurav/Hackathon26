from sqlalchemy.orm import Session
from app import models, schemas
from datetime import datetime


def get_expenses(db: Session) -> list[models.ExpenseEntry]:
    return db.query(models.ExpenseEntry).order_by(models.ExpenseEntry.created_at.desc()).all()


def create_expense(db: Session, expense: schemas.ExpenseEntryCreate) -> models.ExpenseEntry:
    db_obj = models.ExpenseEntry(
        category=expense.category,
        amount=expense.amount,
        currency=expense.currency,
        description=expense.description,
        created_at=datetime.utcnow(),
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def list_market_news(db: Session) -> list[models.MarketNews]:
    return db.query(models.MarketNews).order_by(models.MarketNews.created_at.desc()).all()


def create_market_news(db: Session, title: str, source: str, sentiment: str, excerpt: str) -> models.MarketNews:
    db_obj = models.MarketNews(
        title=title,
        source=source,
        sentiment=sentiment,
        excerpt=excerpt,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
