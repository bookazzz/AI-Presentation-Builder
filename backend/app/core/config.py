"""Application configuration."""

from pydantic_settings import BaseSettings
from typing import Literal


class Settings(BaseSettings):
    app_name: str = "AI Presentation Builder"
    debug: bool = False
    secret_key: str = "change...n"

    # Database
    database_url: str = "postgresql+asyncpg://user:password@localhost:5432/ai_presentation_builder"
    database_url_sync: str = "postgresql+psycopg2://user:password@localhost:5432/ai_presentation_builder"

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Celery
    celery_broker_url: str = "redis://localhost:6379/0"
    celery_result_backend: str = "redis://localhost:6379/0"

    # LLM
    llm_provider: str = "openai"
    llm_api_key: str = ""
    llm_model_fast: str = "gpt-4o-mini"
    llm_model_strong: str = "gpt-4o"

    # Storage
    storage_backend: Literal["local", "s3"] = "local"
    storage_local_path: str = "./uploads"

    # CORS
    frontend_url: str = "http://localhost:3000"

    # Limits
    max_file_size_mb: int = 20
    max_text_length: int = 100000
    max_excel_rows: int = 20000
    max_excel_sheets: int = 10
    max_slides_free: int = 8
    max_slides_start: int = 25
    max_slides_pro: int = 50

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
