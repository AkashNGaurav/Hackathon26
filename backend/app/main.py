from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app import models, schemas, crud, agents, db as db_module
from app.conf.config import services
from app.depends import get_db, get_llm
from contextlib import asynccontextmanager

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


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
)

models.Base.metadata.create_all(bind=db_module.engine)


@app.get("/api/health")
def health():
    return {"status": "ok", "message": "AI fintech backend running"}


@app.get("/api/recommendations", response_model=schemas.RecommendationResponse)
async def get_recommendations(
    risk_profile: str = Query("moderate", regex="^(low|moderate|high)$"),
    investment_horizon: int = Query(5, ge=1, le=30),
    db: Session = Depends(get_db),
    llm: "OpenAI" = Depends(get_llm),
):
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
