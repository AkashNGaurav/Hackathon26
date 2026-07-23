from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app import models, schemas, crud, agents, auth, db as db_module
from app.routers import market_data, ai_advisor, trading

app = FastAPI(title="Fintech AI Assistant")

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
)


@app.options("/{full_path:path}")
def options_handler(full_path: str):
    return {}


models.Base.metadata.create_all(bind=db_module.engine)

# Register routers
app.include_router(market_data.router)
app.include_router(ai_advisor.router)
app.include_router(trading.router)


@app.post("/api/ai/recommend-mf")
def recommend_mf_alias(payload: schemas.MFRecommendRequest):
    return ai_advisor.get_ai_mutual_fund_recommendations(payload)


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
    risk_profile: str = Query("moderate"),
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


# --- Authentication Endpoints ---

@app.post("/api/auth/register", response_model=schemas.Token, status_code=201)
def register(user_in: schemas.UserRegister, db: Session = Depends(get_db)):
    if crud.get_user_by_username(db, user_in.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if crud.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = crud.create_user(db, user_in)
    access_token = auth.create_access_token(data={"sub": user.username, "user_id": user.id})
    return schemas.Token(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse.model_validate(user) if hasattr(schemas.UserResponse, "model_validate") else schemas.UserResponse.from_orm(user)
    )


@app.post("/api/auth/login", response_model=schemas.Token)
def login(user_in: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, user_in.username)
    if not user or not auth.verify_password(user_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    access_token = auth.create_access_token(data={"sub": user.username, "user_id": user.id})
    return schemas.Token(
        access_token=access_token,
        token_type="bearer",
        user=schemas.UserResponse.model_validate(user) if hasattr(schemas.UserResponse, "model_validate") else schemas.UserResponse.from_orm(user)
    )


@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user


@app.put("/api/auth/me/kyc", response_model=schemas.KYCUpdateResponse)
def update_kyc(
    kyc_in: schemas.KYCUpdateSchema,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    updated_user = crud.update_user_kyc(db, current_user, kyc_in.kyc_completed)
    return schemas.KYCUpdateResponse(
        id=updated_user.id,
        email=updated_user.email,
        username=updated_user.username,
        country=updated_user.country,
        kyc_completed=updated_user.kyc_completed,
        message="KYC status updated successfully",
    )

