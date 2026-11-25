"""Tentatives de connexion échouées : servent à freiner les attaques par force brute.

Gardées en base (et non en mémoire) pour que la limite tienne même avec plusieurs
exemplaires de l'API ou après un redémarrage.
"""

from datetime import UTC, datetime

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


class LoginAttempt(SQLModel, table=True):
    __tablename__ = "login_attempt"

    id: int | None = Field(default=None, primary_key=True)
    # L'e-mail tapé, qu'un compte existe ou non (sinon on révélerait quels comptes existent)
    email: str = Field(max_length=254, index=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_type=DateTime(timezone=True),
        index=True,
    )
