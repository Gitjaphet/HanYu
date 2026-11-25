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


def import_progress(session: Session, user_id: int, items: list[dict]) -> None:
    """Fusionne la progression d'un invité (venue du navigateur) avec celle du compte.

    Ces données n'ont pas été vues par le serveur : elles sont vérifiées avant d'être gardées.
    - parcours dans l'ordre du cursus : une leçon n'est prise que si la précédente est terminée ;
    - XP plafonné au maximum possible, date future ramenée à maintenant ;
    - fusion « le meilleur des deux » avec ce qui est déjà enregistré.
    """
    now = datetime.now(UTC)
    by_lesson = {item["lesson_id"]: item for item in items}
    lessons = {
        lesson.id: lesson
        for lesson in session.exec(select(Lesson).where(Lesson.id.in_(by_lesson.keys()))).all()
    }
    existing = {
        p.lesson_id: p
        for p in session.exec(select(LessonProgress).where(LessonProgress.user_id == user_id)).all()
    }

    previous_done = True  # la première leçon du cursus est toujours ouverte
    for lesson_id in curriculum_order(session):
        current = existing.get(lesson_id)
        item = by_lesson.get(lesson_id)
        if item is not None and previous_done and lesson_id in lessons:
            current = current or LessonProgress(user_id=user_id, lesson_id=lesson_id)
            _merge(current, item, max_xp=len(lessons[lesson_id].quiz) * XP_PER_CORRECT, now=now)
            session.add(current)
            existing[lesson_id] = current
        previous_done = current is not None and current.quiz_done


def _merge(progress: LessonProgress, item: dict, max_xp: int, now: datetime) -> None:
    quiz_done = item["quiz_done"] and item["stars"] > 0  # un quiz réussi a au moins 1 étoile
    progress.vocab_done |= item["vocab_done"] or quiz_done
    progress.dialogue_done |= item["dialogue_done"] or quiz_done
    if not quiz_done:
        return
    progress.quiz_done = True
    progress.stars = max(progress.stars, item["stars"])
    progress.xp = max(progress.xp, min(item["xp"], max_xp))
    completed = min(item["completed_at"] or now, now)
    if completed.tzinfo is None:  # date sans fuseau : considérée comme UTC
        completed = completed.replace(tzinfo=UTC)
    if progress.completed_at is None or completed < _aware(progress.completed_at):
        progress.completed_at = completed


def _aware(value: datetime) -> datetime:
    """SQLite rend les dates sans fuseau : on les considère en UTC pour pouvoir comparer."""
    return value if value.tzinfo else value.replace(tzinfo=UTC)
