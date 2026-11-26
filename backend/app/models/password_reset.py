"""Jetons de réinitialisation du mot de passe, envoyés par e-mail.

Seule l'empreinte SHA-256 du jeton est gardée : quelqu'un qui lirait la base
(sauvegarde volée, fuite) ne pourrait pas s'en servir pour changer un mot de passe.
"""

from datetime import UTC, datetime

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


class PasswordResetToken(SQLModel, table=True):
    __tablename__ = "password_reset_token"

    id: int | None = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user_account.id", ondelete="CASCADE", index=True)
    # SHA-256 en hexadécimal (64 caractères) du jeton envoyé dans le lien
    token_hash: str = Field(max_length=64, unique=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_type=DateTime(timezone=True),
        index=True,
    )
    expires_at: datetime = Field(sa_type=DateTime(timezone=True))
    # Rempli à l'utilisation, ou quand un autre lien du même compte a servi : un lien ne sert qu'une fois
    used_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
