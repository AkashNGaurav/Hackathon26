import uuid
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Query, status
from sqlalchemy.orm import Session
from app import models, schemas, crud, agents, db as db_module

app = FastAPI(title="Fintech AI Assistant")

models.Base.metadata.create_all(bind=db_module.engine)


def get_db():
    db = db_module.SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "AI fintech backend running"}


@app.get("/api/recommendations", response_model=schemas.RecommendationResponse)
def get_recommendations(
    risk_profile: str = Query("moderate", regex="^(low|moderate|high)$"),
    investment_horizon: int = Query(5, ge=1, le=30),
    db: Session = Depends(get_db),
):
    agent = agents.InvestmentAgent(db)
    recommendation = agent.recommend(risk_profile=risk_profile, investment_horizon=investment_horizon)
    return recommendation


@app.get("/api/sentiment", response_model=schemas.SentimentResponse)
def get_sentiment(db: Session = Depends(get_db)):
    agent = agents.SentimentAgent(db)
    return agent.analyze_market_sentiment()


@app.get("/api/expenses", response_model=list[schemas.ExpenseEntryResponse])
def list_expenses(db: Session = Depends(get_db)):
    return crud.get_expenses(db)


@app.post("/api/expenses", response_model=schemas.ExpenseEntryResponse)
def add_expense(expense: schemas.ExpenseEntryCreate, db: Session = Depends(get_db)):
    return crud.create_expense(db, expense)


# --- Asset CRUD Endpoints ---

@app.post("/api/assets", response_model=schemas.AssetResponse, status_code=status.HTTP_201_CREATED)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    existing = crud.get_asset_by_code(db, asset.asset_code)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Asset with asset_code '{asset.asset_code}' already exists."
        )
    return crud.create_asset(db, asset)


@app.get("/api/assets", response_model=list[schemas.AssetResponse])
def list_assets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    asset_type: Optional[models.AssetType] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    return crud.get_assets(db, skip=skip, limit=limit, asset_type=asset_type, is_active=is_active)


@app.get("/api/assets/{asset_id}", response_model=schemas.AssetResponse)
def get_asset(asset_id: uuid.UUID, db: Session = Depends(get_db)):
    db_asset = crud.get_asset(db, asset_id)
    if not db_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID '{asset_id}' not found."
        )
    return db_asset


@app.put("/api/assets/{asset_id}", response_model=schemas.AssetResponse)
def update_asset(asset_id: uuid.UUID, asset_update: schemas.AssetUpdate, db: Session = Depends(get_db)):
    db_asset = crud.get_asset(db, asset_id)
    if not db_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID '{asset_id}' not found."
        )
    if asset_update.asset_code and asset_update.asset_code != db_asset.asset_code:
        existing = crud.get_asset_by_code(db, asset_update.asset_code)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Asset code '{asset_update.asset_code}' is already taken."
            )
    return crud.update_asset(db, db_asset, asset_update)


@app.delete("/api/assets/{asset_id}")
def delete_asset(asset_id: uuid.UUID, db: Session = Depends(get_db)):
    db_asset = crud.get_asset(db, asset_id)
    if not db_asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID '{asset_id}' not found."
        )
    crud.delete_asset(db, db_asset)
    return {"message": f"Asset '{db_asset.asset_name}' deleted successfully", "id": str(asset_id)}


# --- Asset Allocation Endpoints (POST and GET ONLY) ---

@app.post("/api/asset-allocations", response_model=schemas.AssetAllocationResponse, status_code=status.HTTP_201_CREATED)
def create_asset_allocation(allocation: schemas.AssetAllocationCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == allocation.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{allocation.user_id}' not found."
        )
    asset = crud.get_asset(db, allocation.asset_id)
    if not asset:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset with ID '{allocation.asset_id}' not found."
        )
    return crud.create_asset_allocation(db, allocation)


@app.get("/api/asset-allocations", response_model=list[schemas.AssetAllocationResponse])
def list_asset_allocations(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    user_id: Optional[uuid.UUID] = None,
    asset_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
):
    return crud.get_asset_allocations(db, skip=skip, limit=limit, user_id=user_id, asset_id=asset_id)


@app.get("/api/asset-allocations/{allocation_id}", response_model=schemas.AssetAllocationResponse)
def get_asset_allocation(allocation_id: int, db: Session = Depends(get_db)):
    db_allocation = crud.get_asset_allocation(db, allocation_id)
    if not db_allocation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Asset allocation with ID '{allocation_id}' not found."
        )
    return db_allocation


