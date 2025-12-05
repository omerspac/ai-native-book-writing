from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI-Native Book Platform"
    DATABASE_URL: str
    QDRANT_API_KEY: str
    QDRANT_HOST: str
    GEMINI_API_KEY: str
    BETTER_AUTH_SECRET: str

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
