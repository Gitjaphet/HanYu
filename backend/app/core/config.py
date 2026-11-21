from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HanYu API"
    environment: str = "development"
    cors_origins: list[str] = ["http://localhost:3000"]
    database_url: str = "postgresql+psycopg://hanyu:hanyu@localhost:5433/hanyu"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
