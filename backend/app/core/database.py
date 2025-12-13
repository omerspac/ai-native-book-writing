from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import text # Added this import
import os
from dotenv import load_dotenv
from urllib.parse import urlparse, parse_qs, urlunparse, urlencode # Added for URL parsing

load_dotenv()

# Example for Neon Postgres URL: "postgresql+asyncpg://user:password@host:port/dbname"
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL must be set in .env file")

# Parse the DATABASE_URL to extract sslmode and pass it via connect_args for asyncpg
parsed_url = urlparse(DATABASE_URL)
query_params = parse_qs(parsed_url.query)
connect_args = {}
clean_url = DATABASE_URL # Default to original URL

if 'sslmode' in query_params:
    sslmode_value = query_params.pop('sslmode')[0]
    if sslmode_value == 'require':
        connect_args['ssl'] = True # asyncpg uses 'ssl' parameter, usually boolean true/false or a context
    elif sslmode_value == 'prefer':
        connect_args['ssl'] = 'require' # asyncpg equivalent for 'prefer' is 'require'
    elif sslmode_value == 'disable':
        connect_args['ssl'] = False
    # Reconstruct the URL without sslmode in the query string
    new_query = urlencode(query_params, doseq=True)
    clean_url = urlunparse(parsed_url._replace(query=new_query))
else:
    clean_url = DATABASE_URL # Use original URL if no sslmode

engine = create_async_engine(clean_url, connect_args=connect_args)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)
Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

# Import models to ensure they are registered with SQLAlchemy Base
from backend.app.models import user

async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;")) # Ensure vector extension is created first
        await conn.run_sync(Base.metadata.create_all)
