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

    # Run Alembic migration or stamp to head
    try:
        alembic_cfg = Config("alembic.ini")
        try:
            command.upgrade(alembic_cfg, "head")
            print("Alembic migration upgraded to head successfully!")
        except Exception:
            command.stamp(alembic_cfg, "head")
            print("Alembic database successfully stamped to head!")
    except Exception as e:
        print(f"Alembic sync notice: {e}")


if __name__ == "__main__":
    sync_database()

