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
2. Create `.env` file in `backend/` (or copy from `.env.example`):
   ```ini
   SECRET_KEY=8998e2ae7a2ee313d65cff92222b61dbc68d21a63b9de7afd4b273ae85730ade
   SALT_SECRET=b0d5d18ae0bb1c0cdc62b160865eb359
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_SECONDS=86400
   DATABASE_URL=sqlite:///./fintech.db
   ```

### Database Initialization & Alembic Migrations

To initialize or migrate the database schema to `head` (`0005_change_user_id_to_uuid`):

1. **Option 1: Using Alembic CLI**:
   ```bash
   cd backend
   alembic upgrade head
   ```
2. **Option 2: Using Sync Script**:
   ```bash
   cd backend
   python sync_db.py
   ```
3. **Check Current Alembic Head**:
   ```bash
   alembic current
   ```

### Run Backend

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Run Automated Test Suite

```bash
cd backend
python test_all_endpoints.py
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## Project Structure

- `backend/` - API, models, schemas, auth utils, Alembic migrations
- `frontend/` - React dashboard and UI

## Alembic Migration History

- `0001_init` - Base tables (`expense_entries`, `market_news`)
- `0002_add_asset_model` - Master `assets` table
- `0003_add_user_model` - `users` account table
- `0004_add_asset_allocation_model` - `asset_allocations` table
- `0005_change_user_id_to_uuid` - Updated `User.id` and `user_id` foreign keys to UUID v4 (**HEAD**)

## API Endpoints

### Authentication & Users
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login & JWT token generation
- `GET /api/auth/me` - Get current user profile (Requires `Bearer <token>`)
- `PUT /api/auth/me/kyc` - Update KYC verification status (Requires `Bearer <token>`)

### Assets Management
- `POST /api/assets` - Create a financial asset
- `GET /api/assets` - List financial assets (Filter by `asset_type`, `is_active`)
- `GET /api/assets/{asset_id}` - Get asset details by UUID
- `PUT /api/assets/{asset_id}` - Update asset details by UUID
- `DELETE /api/assets/{asset_id}` - Delete asset by UUID

### Asset Allocations
- `POST /api/asset-allocations` - Create user investment holding (Auto-calculates `invested_amount`)
- `GET /api/asset-allocations` - List holdings (Filter by `user_id`, `asset_id`, includes nested `asset` details)
- `GET /api/asset-allocations/{allocation_id}` - Get holding details by ID

### AI & Expenses
- `GET /api/health` - Backend health status
- `GET /api/recommendations` - Portfolio allocation recommendations
- `GET /api/sentiment` - Market news sentiment analysis
- `GET /api/expenses` - List expense entries
- `POST /api/expenses` - Create expense entry

