from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
import os

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=Path(__file__).resolve().parents[3] / ".env", extra='allow')

    PROJECT_NAME: str = "AI-Native Book Platform"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL") or os.getenv("NEON_DB_URL")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY")
    QDRANT_HOST: str = os.getenv("QDRANT_HOST") or os.getenv("QDRANT_URL")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    BETTER_AUTH_SECRET: str = os.getenv("BETTER_AUTH_SECRET") or os.getenv("SECRET_KEY")

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

settings = Settings()
