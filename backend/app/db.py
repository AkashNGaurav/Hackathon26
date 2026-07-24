import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
load_dotenv()

raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./fintech.db")

connect_args = {}
if raw_db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
    try:
        clean_path = raw_db_url
        for prefix in ["sqlite:////", "sqlite:///", "sqlite://"]:
            if clean_path.startswith(prefix):
                clean_path = clean_path[len(prefix):]
                break
        
        if clean_path and not clean_path.startswith(":memory:"):
            abs_path = os.path.abspath(clean_path)
            parent_dir = os.path.dirname(abs_path)
            if parent_dir:
                os.makedirs(parent_dir, exist_ok=True)
            DATABASE_URL = f"sqlite:///{abs_path}"
        else:
            DATABASE_URL = raw_db_url
    except Exception as e:
        logger.warning(f"Could not prepare custom SQLite path ({e}). Falling back to sqlite:///./fintech.db")
        DATABASE_URL = "sqlite:///./fintech.db"
else:
    DATABASE_URL = raw_db_url

# Initialize engine with self-healing fallback if configured path is unwritable
try:
    engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)
    with engine.connect() as conn:
        pass
except Exception as err:
    logger.warning(f"Failed connecting to {DATABASE_URL} ({err}). Falling back to local ./fintech.db.")
    DATABASE_URL = "sqlite:///./fintech.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
