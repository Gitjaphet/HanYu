"""Progression d'un élève : une ligne par compte et par leçon.

Le serveur en est la référence : le navigateur affiche, le serveur enregistre et calcule
(étoiles, XP). Plus tard, une école pourra suivre ses élèves grâce à cette table.
"""

from datetime import UTC, datetime

from sqlalchemy import CheckConstraint, DateTime, UniqueConstraint
from sqlmodel import Field, SQLModel


def _now() -> datetime:
    return datetime.now(UTC)


class LessonProgress(SQLModel, table=True):
    __tablename__ = "lesson_progress"
    __table_args__ = (
        # Une seule ligne par (élève, leçon). Cette contrainte sert aussi d'index
        # pour « toute la progression d'un élève » (user_id est en première colonne).
        UniqueConstraint("user_id", "lesson_id", name="uq_lesson_progress_user_lesson"),
        CheckConstraint("stars BETWEEN 0 AND 3", name="stars"),
        CheckConstraint("xp >= 0", name="xp"),
    )

    id: int | None = Field(default=None, primary_key=True)
    # Compte supprimé → sa progression part avec lui (ondelete CASCADE, géré par la base)
    user_id: int = Field(foreign_key="user_account.id", ondelete="CASCADE")
    lesson_id: int = Field(foreign_key="lesson.id", ondelete="CASCADE", index=True)

    vocab_done: bool = Field(default=False)
    dialogue_done: bool = Field(default=False)
    quiz_done: bool = Field(default=False)
    stars: int = Field(default=0)  # meilleur score au quiz, de 0 à 3
    xp: int = Field(default=0)

    # Date de réussite du quiz : sert à la série et au calendrier
    completed_at: datetime | None = Field(default=None, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(
        default_factory=_now,
        sa_type=DateTime(timezone=True),
        sa_column_kwargs={"onupdate": _now},
    )
