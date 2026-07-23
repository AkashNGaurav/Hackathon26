# AI Investment and Wealth Management App

An end-to-end Python + React + PostgreSQL application for AI-powered investment portfolio recommendations, market sentiment analysis, and spend tracking.

## Architecture Overview

- Backend: FastAPI, SQLAlchemy, Alembic
- Frontend: React + Vite
- Database: PostgreSQL
- Deployment: Docker Compose

## Features

- AI-powered investment portfolio recommendation
- Market sentiment insights from curated news
- Expense tracking and budget summary
- Agent-based backend structure for modular AI actions

## Setup

### Prerequisites

- Python 3.11+ or 3.10
- Node 18+ / npm 10+
- Docker & Docker Compose (recommended)

### Run with Docker Compose

1. From project root:
   ```bash
   docker compose up --build
   ```
2. Wait for services to start.
3. Open frontend at `http://localhost:5173`.
4. Backend API runs at `http://localhost:8000/docs`.
5. For closing docker use command: 
    ```bash
    docker compose down
    ```

### Local Backend Setup (without Docker)

1. Create a Python virtual environment in `backend/`:
   ```bash
   cd backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r requirements.txt
   ```
2. Create `.env` file in `backend/` with:
   ```ini
   DATABASE_URL=postgresql+psycopg://fintech:fintech123@localhost:5432/fintech
   GEMINI_API_URL=
   GEMINI_API_KEY=
   ```
3. Start local PostgreSQL or use Docker Compose database service.

### Database Initialization with Alembic

1. From `backend/`:
   ```bash
   alembic upgrade head
   ```
2. This creates tables and inserts dummy data.

### Run Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

- `backend/` - API, models, agents, Alembic migrations
- `frontend/` - React dashboard and UI

## Alembic Usage

- Initialize migrations: `alembic revision --autogenerate -m "init"
- Apply migrations: `alembic upgrade head`

## AI Notes

The backend includes an agent pattern for investment and sentiment recommendations. The AI model integration is abstracted through a Gemini-compatible client interface. If configured, it can call a Gemini-style endpoint.

## Endpoints

- `GET /api/health`
- `POST /api/chat/mutual-funds`
- `POST /api/chat/etfs`
- `POST /api/chat/stocks`
- `POST /api/chat/investment-advisor`
- `GET /api/recommendations?risk_profile=moderate&investment_horizon=5`
- `GET /api/sentiment`
- `GET /api/expenses`
- `POST /api/expenses`

See [specialist-chat-agents.md](docs/specialist-chat-agents.md) for the API contracts, session memory model, and request flow.
