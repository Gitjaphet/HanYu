"""Données échangées par les routes /progress (format identique au type LessonProgress du frontend)."""

from datetime import datetime

from pydantic import Field

from app.models import LessonProgress
from app.schemas.lesson import ApiModel
from app.services.progress import HEARTS


class ProgressOut(ApiModel):
    lesson_id: int
    vocab_done: bool
    dialogue_done: bool
    quiz_done: bool
    stars: int
    xp: int
    completed_at: datetime | None = None


class QuizResultIn(ApiModel):
    """Le navigateur envoie les réponses comptées ; le serveur en déduit étoiles et XP."""

    correct: int = Field(ge=0)
    wrong: int = Field(ge=0, le=HEARTS)


class ProgressIn(ApiModel):
    """Progression d'une leçon telle que le navigateur l'a gardée pour un invité."""

    lesson_id: int
    vocab_done: bool = False
    dialogue_done: bool = False
    quiz_done: bool = False
    stars: int = Field(default=0, ge=0, le=3)
    xp: int = Field(default=0, ge=0)
    completed_at: datetime | None = None


class ProgressImportIn(ApiModel):
    items: list[ProgressIn] = Field(max_length=1000)


def progress_out(p: LessonProgress) -> ProgressOut:
    return ProgressOut(
        lesson_id=p.lesson_id,
        vocab_done=p.vocab_done,
        dialogue_done=p.dialogue_done,
        quiz_done=p.quiz_done,
        stars=p.stars,
        xp=p.xp,
        completed_at=p.completed_at,
    )
