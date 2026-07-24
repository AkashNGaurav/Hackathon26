import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
load_dotenv()

raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./fintech.db")

# If PostgreSQL URL is provided, use PostgreSQL.
# Otherwise, for SQLite, always use safe ./fintech.db in container working directory.
if raw_db_url.startswith("postgres"):
    DATABASE_URL = raw_db_url
    connect_args = {}
else:
    DATABASE_URL = "sqlite:///./fintech.db"
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
