from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create the SQLAlchemy engine
# The DATABASE_URL is loaded from environment variables via Pydantic settings
engine = create_engine(settings.DATABASE_URL)

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