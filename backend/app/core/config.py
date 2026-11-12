import os
import warnings
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "PromisePay API"
    DATABASE_URL: Optional[str] = "sqlite:///./promisepay.db"
    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: Optional[str] = None
    LLM_MODEL: str = "gemini-1.5-flash"

    PAYPAL_MODE: str = "mock"
    PAYPAL_CLIENT_ID: Optional[str] = None
    PAYPAL_CLIENT_SECRET: Optional[str] = None
    PAYPAL_BASE_URL: str = "https://api-m.sandbox.paypal.com"

    FRONTEND_URL: str = "http://localhost:5173"
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
if not settings.DATABASE_URL or settings.DATABASE_URL.strip() == "":
    settings.DATABASE_URL = "sqlite:///./promisepay.db"

# Security: warn if JWT_SECRET is using default in non-test mode
_is_test = os.getenv("PYTEST_CURRENT_TEST") is not None or "test_" in os.getenv("DATABASE_URL", "")
if settings.JWT_SECRET == "dev-secret-change-in-production" and not _is_test:
    warnings.warn(
        "JWT_SECRET is using the default development value. "
        "Set a strong secret via JWT_SECRET environment variable in production.",
        RuntimeWarning
    )
