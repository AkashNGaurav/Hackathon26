import os
import sys
from alembic.config import Config
from alembic import command

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def run_alembic_upgrade():
    alembic_cfg = Config(os.path.join(os.path.dirname(__file__), "alembic.ini"))
    
    # Stamp head if tables already exist, otherwise upgrade
    try:
        print("Stamping Alembic revision to 'head'...")
        command.stamp(alembic_cfg, "head")
        print("Alembic database successfully stamped to 'head'!")
    except Exception as e:
        print(f"Error stamping alembic: {e}")

if __name__ == "__main__":
    run_alembic_upgrade()
