"""Règles de la progression : déblocage des leçons, ordre des étapes, calcul du quiz.

Ce sont les mêmes règles que le frontend (lib/progress.ts), mais c'est le serveur qui décide :
un élève ne peut pas s'attribuer des étoiles ou une leçon en modifiant le navigateur.
"""

from datetime import UTC, datetime

from sqlmodel import Session, select

from app.models import Lesson, LessonProgress, Level, Unit

STEPS = ("vocab", "dialogue", "quiz")  # ordre des étapes d'une leçon
XP_PER_CORRECT = 10
HEARTS = 3  # erreurs permises avant l'échec du quiz


def quiz_stars(correct: int, total: int, failed: bool) -> int:
    """3 = sans faute, 2 = au moins 70 %, 1 = réussi, 0 = échoué."""
    if failed or total == 0:
        return 0
    if correct == total:
        return 3
    if correct >= total * 0.7:
        return 2
    return 1


def curriculum_order(session: Session) -> list[int]:
    """Identifiants des leçons dans l'ordre du cursus : niveau, unité, puis leçon."""
    statement = (
        select(Lesson.id)
        .join(Unit)
        .join(Level)
        .order_by(Level.position, Unit.number, Lesson.position)
    )
    return list(session.exec(statement).all())


def is_unlocked(session: Session, user_id: int, lesson_id: int) -> bool:
    """Une leçon est ouverte si c'est la première, ou si la précédente est terminée."""
    order = curriculum_order(session)
    index = order.index(lesson_id)
    if index == 0:
        return True
    previous = session.exec(
        select(LessonProgress).where(
            LessonProgress.user_id == user_id, LessonProgress.lesson_id == order[index - 1]
        )
    ).first()
    return previous is not None and previous.quiz_done


def missing_steps(lesson: Lesson, progress: LessonProgress, step: str) -> list[str]:
    """Étapes de la leçon à faire avant `step` (seulement celles que la leçon contient)."""
    done = {"vocab": progress.vocab_done, "dialogue": progress.dialogue_done}
    before = STEPS[: STEPS.index(step)]
    return [s for s in before if s in lesson.modules and not done.get(s, False)]


def apply_quiz(progress: LessonProgress, correct: int, total: int, wrong: int) -> None:
    """Enregistre un quiz : raté → rien ne change ; réussi → on garde le meilleur résultat."""
    stars = quiz_stars(correct, total, failed=wrong >= HEARTS)
    if stars == 0:
        return
    progress.quiz_done = True
    progress.stars = max(progress.stars, stars)
    progress.xp = max(progress.xp, correct * XP_PER_CORRECT)
    if progress.completed_at is None:  # la première réussite compte pour la série
        progress.completed_at = datetime.now(UTC)
