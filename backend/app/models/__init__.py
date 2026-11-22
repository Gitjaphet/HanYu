# Importer ce paquet enregistre toutes les tables auprès de SQLModel.metadata
from sqlmodel import SQLModel

# Noms de contraintes prévisibles (ix_…, fk_…) : indispensable pour qu'Alembic
# puisse les modifier ou les supprimer plus tard. Doit être défini AVANT les tables.
SQLModel.metadata.naming_convention = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

from app.models.lesson import (  # noqa: E402  (après la convention, exprès)
    QUIZ_TYPES,
    DialogueLine,
    Lesson,
    Level,
    QuizQuestion,
    Unit,
    VocabItem,
)

__all__ = ["QUIZ_TYPES", "DialogueLine", "Lesson", "Level", "QuizQuestion", "Unit", "VocabItem"]
