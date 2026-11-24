import secrets

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "HanYu API"
    environment: str = "development"
    cors_origins: list[str] = ["http://localhost:3000"]
    database_url: str = "postgresql+psycopg://hanyu:hanyu@localhost:5433/hanyu"

    # Clé de signature des jetons de session. En production : obligatoire, fournie par .env.
    # En développement : une clé aléatoire à chaque démarrage (il suffit de se reconnecter).
    jwt_secret: str = ""
    session_days: int = 7

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @model_validator(mode="after")
    def check_jwt_secret(self) -> "Settings":
        if not self.jwt_secret:
            if self.is_production:
                raise ValueError("JWT_SECRET manquant : obligatoire en production")
            self.jwt_secret = secrets.token_urlsafe(32)
        elif len(self.jwt_secret) < 32:
            raise ValueError("JWT_SECRET trop court : 32 caractères minimum")
        return self


settings = Settings()
