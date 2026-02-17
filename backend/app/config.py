from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

# Get the backend directory (where .env should be)
BACKEND_DIR = Path(__file__).parent.parent


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://postgres:password@localhost:5432/kpdf"

    # JWT
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 7

    # Telegram
    telegram_bot_token: str = ""
    telegram_webhook_secret: str = ""

    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""

    # Frontend
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]

    # Environment
    environment: str = "development"

    # File uploads
    upload_dir: str = "static/uploads"
    max_upload_size_mb: int = 5

    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


def clear_settings_cache():
    """Clear the settings cache (useful after .env changes)."""
    get_settings.cache_clear()
