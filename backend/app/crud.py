import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session, joinedload
from app import models, schemas




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


# --- User CRUD Operations ---

def get_user_by_id(db: Session, user_id: uuid.UUID) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_username(db: Session, username: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.username == username).first()


def create_user(db: Session, user_data: schemas.UserRegisterRequest) -> models.User:
    from app.auth_utils import hash_password
    db_user = models.User(
        email=user_data.email,
        username=user_data.username,
        hashed_password=hash_password(user_data.password),
        country=user_data.country,
        kyc_completed=False,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, username: str, password: str) -> Optional[models.User]:
    from app.auth_utils import verify_password
    user = get_user_by_username(db, username)
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user


def update_user_kyc(db: Session, user: models.User, kyc_completed: bool) -> models.User:
    user.kyc_completed = kyc_completed
    db.commit()
    db.refresh(user)
    return user




# --- Asset CRUD Operations ---

def get_asset(db: Session, asset_id: uuid.UUID) -> Optional[models.Asset]:
    return db.query(models.Asset).filter(models.Asset.id == asset_id).first()


def get_asset_by_code(db: Session, asset_code: str) -> Optional[models.Asset]:
    return db.query(models.Asset).filter(models.Asset.asset_code == asset_code).first()


def get_assets(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    asset_type: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> list[models.Asset]:
    query = db.query(models.Asset)
    if asset_type is not None:
        query = query.filter(models.Asset.asset_type == asset_type)
    if is_active is not None:
        query = query.filter(models.Asset.is_active == is_active)
    return query.order_by(models.Asset.created_at.desc()).offset(skip).limit(limit).all()


def create_asset(db: Session, asset: schemas.AssetCreate) -> models.Asset:
    db_asset = models.Asset(
        asset_code=asset.asset_code,
        asset_name=asset.asset_name,
        asset_type=asset.asset_type,
        issuer=asset.issuer,
        symbol=asset.symbol,
        exchange=asset.exchange,
        currency=asset.currency,
        current_price=asset.current_price,
        risk_level=asset.risk_level,
        logo_url=asset.logo_url,
        is_active=asset.is_active,
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset


def update_asset(db: Session, db_asset: models.Asset, asset_update: schemas.AssetUpdate) -> models.Asset:
    update_data = asset_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_asset, field, value)
    db.commit()
    db.refresh(db_asset)
    return db_asset


def delete_asset(db: Session, db_asset: models.Asset) -> bool:
    db.delete(db_asset)
    db.commit()
    return True


# --- Asset Allocation CRUD Operations ---

def get_asset_allocation(db: Session, allocation_id: int) -> Optional[models.AssetAllocation]:
    return (
        db.query(models.AssetAllocation)
        .options(joinedload(models.AssetAllocation.asset))
        .filter(models.AssetAllocation.id == allocation_id)
        .first()
    )


def get_asset_allocations(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[uuid.UUID] = None,
    asset_id: Optional[uuid.UUID] = None,
) -> list[models.AssetAllocation]:
    query = db.query(models.AssetAllocation).options(joinedload(models.AssetAllocation.asset))
    if user_id is not None:
        query = query.filter(models.AssetAllocation.user_id == user_id)
    if asset_id is not None:
        query = query.filter(models.AssetAllocation.asset_id == asset_id)
    return query.order_by(models.AssetAllocation.created_at.desc()).offset(skip).limit(limit).all()


def create_asset_allocation(db: Session, allocation: schemas.AssetAllocationCreate) -> models.AssetAllocation:
    invested = allocation.invested_amount
    if invested is None:
        invested = allocation.quantity * allocation.average_buy_price

    db_allocation = models.AssetAllocation(
        user_id=allocation.user_id,
        asset_id=allocation.asset_id,
        quantity=allocation.quantity,
        average_buy_price=allocation.average_buy_price,
        invested_amount=invested,
        current_value=allocation.current_value,
        purchase_date=allocation.purchase_date,
    )
    db.add(db_allocation)
    db.commit()
    db.refresh(db_allocation)
    # Refresh eager relationship
    db.query(models.AssetAllocation).options(joinedload(models.AssetAllocation.asset)).filter(models.AssetAllocation.id == db_allocation.id).first()
    return db_allocation



