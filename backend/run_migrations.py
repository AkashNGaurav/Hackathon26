import os
import sys
from alembic.config import Config
from alembic import command

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_alembic_upgrade():
    alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "alembic.ini"))
    
    try:
        print("Upgrading Alembic migrations to 'head'...")
        command.upgrade(alembic_cfg, "head")
        print("Alembic database successfully upgraded to 'head'!")
    except Exception as e:
        print(f"Upgrade failed, stamping Alembic revision to 'head': {e}")
        try:
            command.stamp(alembic_cfg, "head")
            print("Alembic database successfully stamped to 'head'!")
        except Exception as stamp_err:
            print(f"Error stamping alembic: {stamp_err}")


if __name__ == "__main__":
    run_alembic_upgrade()

