from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app import models, schemas
from datetime import datetime


def _commit_and_refresh(db: Session, db_obj):
    """Persist one model and reset the session if the write fails."""
    try:
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj
    except SQLAlchemyError:
        db.rollback()
        raise


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
    return _commit_and_refresh(db, db_obj)


def list_market_news(db: Session) -> list[models.MarketNews]:
    return db.query(models.MarketNews).order_by(models.MarketNews.created_at.desc()).all()


def create_market_news(db: Session, title: str, source: str, sentiment: str, excerpt: str) -> models.MarketNews:
    db_obj = models.MarketNews(
        title=title,
        source=source,
        sentiment=sentiment,
        excerpt=excerpt,
    )
    return _commit_and_refresh(db, db_obj)


def get_agent_checkpoints(
    db: Session, session_id: str, agent_type: str, limit: int = 12
) -> list[models.AgentCheckpoint]:
    """Fetch the most recent turns in chronological order for one agent session."""
    checkpoints = (
        db.query(models.AgentCheckpoint)
        .filter(
            models.AgentCheckpoint.session_id == session_id,
            models.AgentCheckpoint.agent_type == agent_type,
        )
        .order_by(models.AgentCheckpoint.created_at.desc(), models.AgentCheckpoint.id.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(checkpoints))


def create_agent_checkpoint(
    db: Session, session_id: str, agent_type: str, role: str, content: str
) -> models.AgentCheckpoint:
    checkpoint = models.AgentCheckpoint(
        session_id=session_id,
        agent_type=agent_type,
        role=role,
        content=content,
        created_at=datetime.utcnow(),
    )
    return _commit_and_refresh(db, checkpoint)
