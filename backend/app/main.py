from typing import Optional
import uuid
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
import uuid
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, Query, Request, status
from routes import ai_advisor, market_data, trading
from sqlalchemy.orm import Session
from app import models, schemas, crud, agents, db as db_module
from app.conf.config import services
from app.depends import get_db, get_llm, get_model_provider
from contextlib import asynccontextmanager
from app.routers import market_data, ai_advisor
from app import models, schemas, crud, agents, auth, db as db_module

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Runs once on startup and once on shutdown.
    """
    app.state.services = services
    await services.initialize()
    yield

app = FastAPI(title="FinSight AI Assistant",
description="API for querying and managing FinSight AI Application",
lifespan=lifespan)

logger = logging.getLogger(__name__)

# Allow explicit origins for Next.js and Vite dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.options("/{full_path:path}")
def options_handler(full_path: str):
    return {}


models.Base.metadata.create_all(bind=db_module.engine)

# Register routers
app.include_router(market_data.router)
app.include_router(ai_advisor.router)
app.include_router(trading.router)


def get_db():
    db = db_module.SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.exception("Database request failed: %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=503,
        content={"detail": "The database is temporarily unavailable. Please try again."},
    )


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "AI fintech backend running"}


@app.post("/api/chat/mutual-funds", response_model=schemas.ChatResponse)
def chat_mutual_funds(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    return agents.MutualFundAgent(db).reply(request.message, request.session_id)


@app.post("/api/chat/etfs", response_model=schemas.ChatResponse)
def chat_etfs(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    return agents.EtfAgent(db).reply(request.message, request.session_id)


@app.post("/api/chat/stocks", response_model=schemas.ChatResponse)
def chat_stocks(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    return agents.StockAgent(db).reply(request.message, request.session_id)


@app.post("/api/chat/investment-advisor", response_model=schemas.ChatResponse)
def chat_investment_advisor(request: schemas.ChatRequest, db: Session = Depends(get_db)):
    return agents.InvestmentAdvisorAgent(db).reply(request.message, request.session_id)

# --- Auth Endpoints ---

@app.post("/api/auth/register", response_model=schemas.AuthTokenResponse, status_code=status.HTTP_201_CREATED)
def register_user(user_data: schemas.UserRegisterRequest, db: Session = Depends(get_db)):
    from app.auth_utils import create_access_token
    existing_email = crud.get_user_by_email(db, user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists."
        )
    existing_username = crud.get_user_by_username(db, user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username already exists."
        )
    
    db_user = crud.create_user(db, user_data)
    token = create_access_token(user_id=db_user.id, username=db_user.username, email=db_user.email)
    
    return schemas.AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=db_user
    )


@app.post("/api/auth/login", response_model=schemas.AuthTokenResponse)
def login_user(credentials: schemas.UserLoginRequest, db: Session = Depends(get_db)):
    from app.auth_utils import create_access_token
    user = crud.authenticate_user(db, username=credentials.username, password=credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user_id=user.id, username=user.username, email=user.email)
    return schemas.AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=user
    )


from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> models.User:
    from app.auth_utils import decode_access_token
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id_str = payload.get("user_id")
        if not user_id_str:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token claims")
        user_uuid = uuid.UUID(user_id_str)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = crud.get_user_by_id(db, user_uuid)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.put("/api/auth/me/kyc", response_model=schemas.KYCUpdateResponse)
def update_kyc_status(
    kyc_data: schemas.KYCUpdateRequest,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updated_user = crud.update_user_kyc(db, current_user, kyc_data.kyc_completed)
    return schemas.KYCUpdateResponse(
        id=updated_user.id,
        email=updated_user.email,
        username=updated_user.username,
        country=updated_user.country,
        kyc_completed=updated_user.kyc_completed,
        message="KYC status updated successfully"
    )


@app.get("/api/recommendations", response_model=schemas.RecommendationResponse)
def get_recommendations(
    risk_profile: str = Query("moderate"),
    investment_horizon: int = Query(5, ge=1, le=30),
    db: Session = Depends(get_db),
    llm: ChatModelProvider = Depends(get_model_provider)
    llm: ChatModelProvider = Depends(get_model_provider)
):
    agent = agents.InvestmentAgent(db, llm)
    agent = agents.InvestmentAgent(db, llm)
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



