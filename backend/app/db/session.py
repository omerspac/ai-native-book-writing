from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.engine import URL # NEW IMPORT
from backend.app.core.config import settings

# Create the SQLAlchemy engine
# The DATABASE_URL is loaded from environment variables via Pydantic settings
database_url = settings.DATABASE_URL

# Explicitly ensure the URL uses psycopg2 dialect
if database_url.startswith("postgresql+asyncpg"):
    database_url = database_url.replace("postgresql+asyncpg", "postgresql+psycopg2")
elif database_url.startswith("postgresql://"):
    database_url = database_url.replace("postgresql://", "postgresql+psycopg2://")

engine = create_engine(database_url)

# Create a SessionLocal class
# Each instance of SessionLocal will be a database session
# autocommit=False ensures that we have to commit changes explicitly
# autoflush=False prevents flushing until commit
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()