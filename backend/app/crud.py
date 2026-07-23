from sqlalchemy.orm import Session
from app import models, schemas, auth
from datetime import datetime
from typing import Optional


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user: schemas.UserRegister) -> models.User:
    hashed_pwd = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pwd,
        country=user.country,
        kyc_completed=False,
        created_at=datetime.utcnow(),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user_kyc(db: Session, user: models.User, kyc_completed: bool = True) -> models.User:
    user.kyc_completed = kyc_completed
    db.commit()
    db.refresh(user)
    return user



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
