from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app import models, schemas, crud, agents, db as db_module
from app.routers import market_data, ai_advisor

app = FastAPI(title="Fintech AI Assistant")

# Allow explicit origins for Next.js and Vite dev servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=db_module.engine)

# Register routers
app.include_router(market_data.router)
app.include_router(ai_advisor.router)


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
    risk_profile: str = Query("moderate", pattern="^(low|moderate|high)$"),
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
