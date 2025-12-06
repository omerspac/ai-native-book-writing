# backend/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Example for Neon Postgres URL: "postgresql://user:password@host:port/dbname"
DATABASE_URL = os.getenv("NEON_DB_URL")

if not DATABASE_URL:
    raise ValueError("NEON_DB_URL must be set in .env file")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Import models to ensure they are registered with SQLAlchemy Base
from app.models import user

def create_db_and_tables():
    Base.metadata.create_all(bind=engine)
