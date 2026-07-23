import os
import sys
from alembic.config import Config
from alembic import command

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db import engine
from app.models import Base

def sync_database():
    print("Creating all tables in database using SQLAlchemy metadata...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

    # Run Alembic stamp and upgrade
    try:
        alembic_cfg = Config("alembic.ini")
        # If database already had tables without alembic version tracking, stamp 0001_init
        try:
            command.stamp(alembic_cfg, "0001_init")
        except Exception:
            pass
        command.upgrade(alembic_cfg, "head")
        print("Alembic migration upgraded to head successfully!")
    except Exception as e:
        print(f"Alembic upgrade notice: {e}")

if __name__ == "__main__":
    sync_database()
