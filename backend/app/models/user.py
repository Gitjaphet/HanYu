"""Comptes : une personne = un compte, sur toute la plateforme.

Le rôle (élève, professeur, administrateur d'école) n'est PAS ici : il dépend de l'école.
Une même personne pourra être professeur dans une école et élève dans une autre ;
ce lien vivra dans une table d'adhésion (école ↔ compte ↔ rôle), ajoutée plus tard.
"""

from datetime import UTC, datetime

from sqlalchemy import DateTime
from sqlmodel import Field, SQLModel


class User(SQLModel, table=True):
    __tablename__ = "user_account"  # « user » est un mot réservé de PostgreSQL

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(max_length=254, unique=True, index=True)  # toujours en minuscules
    pseudo: str = Field(max_length=30, unique=True, index=True)
    password_hash: str = Field(max_length=255)
    is_active: bool = Field(default=True)
    # Équipe HanYu (toi) : gère les écoles et le contenu de la plateforme. Jamais par inscription.
    is_superadmin: bool = Field(default=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(UTC),
        sa_type=DateTime(timezone=True),
    )
