from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import jwt
from app import models, schemas, db as db_module, auth
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Trading & Wallet"])


def get_db():
    db = db_module.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user_id(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> int:
    """Extract user_id from Authorization token if available, else default to user_id=1."""
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
            user_id = payload.get("user_id")
            if user_id:
                return user_id
            username = payload.get("sub")
            if username:
                user = db.query(models.User).filter(models.User.username == username).first()
                if user:
                    return user.id
        except Exception:
            pass
    return 1


def get_or_create_wallet(db: Session, user_id: int) -> models.UserWallet:
    wallet = db.query(models.UserWallet).filter(models.UserWallet.user_id == user_id).first()
    if not wallet:
        wallet = models.UserWallet(user_id=user_id, balance=12450.0, currency="EUR")
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
    return wallet


@router.get("/api/wallet/balance", response_model=schemas.WalletResponse)
def get_wallet_balance(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    wallet = get_or_create_wallet(db, user_id)
    return wallet


@router.post("/api/wallet/deposit", response_model=schemas.WalletResponse)
def deposit_wallet(
    req: schemas.WalletDepositRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    wallet = get_or_create_wallet(db, user_id)
    wallet.balance += req.amount
    wallet.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(wallet)
    return wallet


@router.post("/api/trading/order", response_model=schemas.OrderResponse)
def execute_trade_order(
    order_in: schemas.OrderRequest,
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    wallet = get_or_create_wallet(db, user_id)
    total_cost = round(order_in.quantity * order_in.price_per_unit, 2)
    tx_type = order_in.transaction_type.upper()

    if tx_type == "BUY":
        if wallet.balance < total_cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient wallet balance (€{wallet.balance:.2f}). Total cost is €{total_cost:.2f}. Please add funds to your wallet."
            )
        # Deduct cost from user wallet
        wallet.balance -= total_cost
        wallet.updated_at = datetime.utcnow()

        # Update or Create User Portfolio Position
        position = db.query(models.PortfolioPosition).filter(
            models.PortfolioPosition.user_id == user_id,
            models.PortfolioPosition.symbol == order_in.symbol.upper()
        ).first()

        if position:
            new_qty = position.quantity + order_in.quantity
            new_total_invested = position.total_invested + total_cost
            position.average_buy_price = round(new_total_invested / new_qty, 2)
            position.quantity = new_qty
            position.total_invested = new_total_invested
            position.updated_at = datetime.utcnow()
        else:
            position = models.PortfolioPosition(
                user_id=user_id,
                symbol=order_in.symbol.upper(),
                asset_name=order_in.asset_name,
                asset_type=order_in.asset_type,
                quantity=order_in.quantity,
                average_buy_price=order_in.price_per_unit,
                total_invested=total_cost,
                updated_at=datetime.utcnow()
            )
            db.add(position)

    elif tx_type == "SELL":
        position = db.query(models.PortfolioPosition).filter(
            models.PortfolioPosition.user_id == user_id,
            models.PortfolioPosition.symbol == order_in.symbol.upper()
        ).first()

        if not position or position.quantity < order_in.quantity:
            avail = position.quantity if position else 0
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient holding. You own {avail} units of {order_in.symbol}, but attempted to sell {order_in.quantity}."
            )

        # Credit proceeds to user wallet
        wallet.balance += total_cost
        wallet.updated_at = datetime.utcnow()

        # Reduce position
        position.quantity -= order_in.quantity
        position.total_invested = max(0.0, position.total_invested - total_cost)
        position.updated_at = datetime.utcnow()
        if position.quantity <= 0.0001:
            db.delete(position)
    else:
        raise HTTPException(status_code=400, detail="Invalid transaction type. Must be BUY or SELL.")

    # Create User Order Audit Record
    order_record = models.OrderRecord(
        user_id=user_id,
        symbol=order_in.symbol.upper(),
        asset_name=order_in.asset_name,
        asset_type=order_in.asset_type,
        transaction_type=tx_type,
        order_type=order_in.order_type.upper(),
        sip_frequency=order_in.sip_frequency,
        quantity=order_in.quantity,
        price_per_unit=order_in.price_per_unit,
        total_amount=total_cost,
        status="COMPLETED",
        created_at=datetime.utcnow()
    )
    db.add(order_record)
    db.commit()
    db.refresh(order_record)

    return order_record


@router.get("/api/trading/portfolio", response_model=list[schemas.PortfolioPositionResponse])
def get_user_portfolio(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    positions = db.query(models.PortfolioPosition).filter(
        models.PortfolioPosition.user_id == user_id
    ).all()
    
    result = []
    from app.routers.market_data import get_market_data

    for pos in positions:
        current_price = pos.average_buy_price
        price_change = 0.0
        pct_change = 0.0
        is_pos = True
        market_status = "OPEN"
        currency = "EUR"
        try:
            m = get_market_data(pos.symbol)
            if m and getattr(m, "current_price", None):
                current_price = float(m.current_price)
                price_change = float(getattr(m, "price_change", 0.0) or 0.0)
                pct_change = float(getattr(m, "percentage_change", 0.0) or 0.0)
                is_pos = bool(getattr(m, "is_positive", True))
                market_status = str(getattr(m, "market_status", "OPEN") or "OPEN")
                currency = str(getattr(m, "currency", "EUR") or "EUR")
        except Exception:
            pass

        current_value = round(pos.quantity * current_price, 2)
        pnl = round(current_value - pos.total_invested, 2)
        pnl_pct = round((pnl / pos.total_invested) * 100, 2) if pos.total_invested > 0 else 0.0

        result.append(schemas.PortfolioPositionResponse(
            id=pos.id,
            symbol=pos.symbol,
            asset_name=pos.asset_name,
            asset_type=pos.asset_type,
            quantity=pos.quantity,
            average_buy_price=pos.average_buy_price,
            total_invested=pos.total_invested,
            current_price=current_price,
            current_value=current_value,
            unrealized_pnl=pnl,
            unrealized_pnl_pct=pnl_pct,
            price_change=price_change,
            percentage_change=pct_change,
            is_positive=is_pos,
            market_status=market_status,
            currency=currency,
            updated_at=pos.updated_at
        ))

    return result


@router.get("/api/trading/orders", response_model=list[schemas.OrderResponse])
def get_user_orders(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    orders = db.query(models.OrderRecord).filter(
        models.OrderRecord.user_id == user_id
    ).order_by(models.OrderRecord.created_at.desc()).all()
    return orders
