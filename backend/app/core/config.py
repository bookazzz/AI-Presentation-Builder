from pydantic_settings import BaseSettings
from typing import List
import os


class Settings(BaseSettings):
    # App
    app_name: str = "AI Presentation Builder"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ai_presentations"
    database_url_sync: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/ai_presentations"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # JWT
    secret_key: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    # LLM settings
    llm_provider: str = "openai"
    llm_api_key: str = ""
    llm_api_base: str = ""
    llm_model: str = "gpt-4o-mini"

    # Files
    upload_dir: str = "./uploads"
    export_dir: str = "./exports"
    max_file_size_mb: int = 20

    # YooKassa
    yookassa_shop_id: str = ""
    yookassa_secret_key: str = ""
    yookassa_return_url: str = "https://bookazzz.github.io/AI-Presentation-Builder/payment-success"
    yookassa_fail_url: str = "https://bookazzz.github.io/AI-Presentation-Builder/payment-failed"

    # LLM
    llm_provider: str = "openai"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"

    # CORS
    cors_origins: List[str] = [
        "http://localhost:3000",
        "https://bookazzz.github.io",
    ]

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
