import logging

from fastapi import FastAPI, Depends, Query, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import SQLAlchemyError
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

app = FastAPI(title="Fintech AI Assistant")
logger = logging.getLogger(__name__)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=db_module.engine)


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
