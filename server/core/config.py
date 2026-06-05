from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "Workout Tracker API"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True
    api_prefix: str = "/api"
    ensure_tables_on_startup: bool = False

    client_origins: str = "http://localhost:5173"

    session_secret_key: str = "change-me-in-production"
    session_cookie_name: str = "workout_tracker_session"
    session_cookie_max_age_seconds: int = 60 * 60 * 24 * 7
    session_cookie_secure: bool = False
    session_cookie_samesite: str = "lax"
    csrf_cookie_name: str = "workout_tracker_csrf"
    csrf_header_name: str = "X-CSRF-Token"
    csrf_cookie_max_age_seconds: int = 60 * 60 * 24 * 7

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "workout_tracker"
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    database_url: str | None = None

    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, value: bool | str) -> bool:
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on", "debug", "development"}
        return value

    @field_validator("session_cookie_secure", mode="before")
    @classmethod
    def parse_session_cookie_secure(cls, value: bool | str) -> bool:
        if isinstance(value, str):
            return value.strip().lower() in {"1", "true", "yes", "on", "secure", "production"}
        return value

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.database_url:
            return self.database_url
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.client_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
