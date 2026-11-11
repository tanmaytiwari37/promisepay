from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "PromisePay API"
    DATABASE_URL: str = "sqlite:///./promisepay.db"
    JWT_SECRET: str = "dev-secret-change-in-production"
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "claude-3-5-sonnet"
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    PAYPAL_BASE_URL: str = "https://api-m.sandbox.paypal.com"
    FRONTEND_URL: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

