"""Progression de l'élève connecté : lecture, et enregistrement de chaque étape d'une leçon."""

from typing import Literal

from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.api.deps import CurrentUser
from app.core.db import SessionDep
from app.models import Lesson, LessonProgress
from app.schemas.progress import ProgressImportIn, ProgressOut, QuizResultIn, progress_out
from app.services.progress import HEARTS, apply_quiz, import_progress, is_unlocked, missing_steps

router = APIRouter(prefix="/progress", tags=["progress"])

STEP_LABELS = {"vocab": "le vocabulaire", "dialogue": "le dialogue"}


@router.get("", response_model=list[ProgressOut])
def my_progress(user: CurrentUser, session: SessionDep) -> list[ProgressOut]:
    rows = session.exec(
        select(LessonProgress).where(LessonProgress.user_id == user.id).order_by(LessonProgress.lesson_id)
    ).all()
    return [progress_out(p) for p in rows]


@router.post("/import", response_model=list[ProgressOut])
def import_guest_progress(data: ProgressImportIn, user: CurrentUser, session: SessionDep) -> list[ProgressOut]:
    """Après connexion : fusionne la progression faite en invité avec celle du compte."""
    import_progress(session, user.id, [item.model_dump() for item in data.items])
    session.commit()
    return my_progress(user, session)


def _open_lesson(session: SessionDep, user_id: int, lesson_id: int, step: str) -> tuple[Lesson, LessonProgress]:
    """Vérifie que la leçon existe, est débloquée et que les étapes précédentes sont faites."""
    lesson = session.exec(
        select(Lesson).where(Lesson.id == lesson_id).options(selectinload(Lesson.quiz))
    ).first()
    if lesson is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="Leçon introuvable")
    if not is_unlocked(session, user_id, lesson_id):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Leçon verrouillée : termine d'abord la précédente")

    progress = session.exec(
        select(LessonProgress).where(LessonProgress.user_id == user_id, LessonProgress.lesson_id == lesson_id)
    ).first() or LessonProgress(user_id=user_id, lesson_id=lesson_id)

    missing = missing_steps(lesson, progress, step)
    if missing:
        raise HTTPException(status.HTTP_409_CONFLICT, detail=f"Termine d'abord {STEP_LABELS[missing[0]]}")
    return lesson, progress


# La route du quiz est déclarée AVANT /{lesson_id}/{step} : FastAPI essaie les routes dans l'ordre,
# et /{step} capturerait « quiz » pour le refuser.
@router.post("/{lesson_id}/quiz", response_model=ProgressOut)
def complete_quiz(lesson_id: int, result: QuizResultIn, user: CurrentUser, session: SessionDep) -> ProgressOut:
    """Enregistre un quiz. Le nombre de questions vient de la base, pas du navigateur."""
    lesson, progress = _open_lesson(session, user.id, lesson_id, "quiz")
    total = len(lesson.quiz)
    answered = result.correct + result.wrong
    failed = result.wrong >= HEARTS
    # Réussi : toutes les questions ont une réponse. Raté : le quiz s'arrête au 3e cœur perdu.
    if answered > total or (not failed and answered != total):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, detail="Résultat de quiz incohérent")

    apply_quiz(progress, result.correct, total, result.wrong)
    session.add(progress)
    session.commit()
    session.refresh(progress)
    return progress_out(progress)


@router.post("/{lesson_id}/{step}", response_model=ProgressOut)
def complete_step(
    lesson_id: int, step: Literal["vocab", "dialogue"], user: CurrentUser, session: SessionDep
) -> ProgressOut:
    """Marque le vocabulaire ou le dialogue comme terminé (rejouer ne change rien)."""
    _, progress = _open_lesson(session, user.id, lesson_id, step)
    setattr(progress, f"{step}_done", True)
    session.add(progress)
    session.commit()
    session.refresh(progress)
    return progress_out(progress)
