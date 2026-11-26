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

    # E-mails transactionnels (Brevo). Sans clé en développement : affichés dans la console.
    brevo_api_key: str = ""
    mail_from_email: str = "no-reply@medevstack.com"
    mail_from_name: str = "HanYu"
    # Adresse publique du site, pour construire les liens envoyés par e-mail
    frontend_url: str = "http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @model_validator(mode="after")
    def check_secrets(self) -> "Settings":
        if not self.jwt_secret:
            if self.is_production:
                raise ValueError("JWT_SECRET manquant : obligatoire en production")
            self.jwt_secret = secrets.token_urlsafe(32)
        elif len(self.jwt_secret) < 32:
            raise ValueError("JWT_SECRET trop court : 32 caractères minimum")
        if self.is_production and not self.brevo_api_key:
            raise ValueError("BREVO_API_KEY manquant : obligatoire en production")
        return self


settings = Settings()
