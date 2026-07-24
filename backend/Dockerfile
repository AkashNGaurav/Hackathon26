FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN python -m pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . /app

# Environment configuration for SQLite and UTF-8 encoding
ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8
ENV DATABASE_URL="sqlite:///./fintech.db"

EXPOSE 8000

# Run alembic migrations and start FastAPI server
CMD ["sh", "-c", "alembic upgrade head || true && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
