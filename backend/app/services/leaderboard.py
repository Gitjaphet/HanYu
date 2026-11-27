"""Classement des élèves, calculé à la demande à partir de la progression enregistrée.

Seul le pseudo est montré, jamais l'e-mail. Un élève sans aucun XP n'apparaît pas.
À égalité d'XP, même rang (1, 2, 2, 4…) ; l'affichage départage par étoiles puis pseudo.
"""

from dataclasses import dataclass

from sqlalchemy import func
from sqlmodel import Session, col, select

from app.models import LessonProgress, User


@dataclass(frozen=True)
class Standing:
    user_id: int
    rank: int
    pseudo: str
    xp: int
    stars: int
    lessons: int


def _standings():
    xp = func.sum(LessonProgress.xp)
    stars = func.sum(LessonProgress.stars)
    lessons = func.count().filter(col(LessonProgress.quiz_done).is_(True))
    return (
        select(
            User.id.label("user_id"),
            func.rank().over(order_by=xp.desc()).label("rank"),
            User.pseudo,
            xp.label("xp"),
            stars.label("stars"),
            lessons.label("lessons"),
        )
        .join(LessonProgress, col(LessonProgress.user_id) == User.id)
        .where(col(User.is_active).is_(True))
        .group_by(User.id, User.pseudo)
        .having(xp > 0)
        .subquery()
    )


def _to_standing(row) -> Standing:
    return Standing(row.user_id, row.rank, row.pseudo, int(row.xp), int(row.stars), int(row.lessons))


def leaderboard(session: Session, user_id: int | None, limit: int) -> tuple[list[Standing], Standing | None, int]:
    """Le haut du classement, la place de l'élève connecté (même hors du haut) et le nombre de classés."""
    table = _standings()
    # select(*table.c) : des lignes complètes (select(table) ne rendrait que la première colonne)
    ordered = select(*table.c).order_by(table.c.rank, table.c.stars.desc(), table.c.pseudo)
    top = [_to_standing(r) for r in session.exec(ordered.limit(limit)).all()]
    me = None
    if user_id is not None:
        row = session.exec(select(*table.c).where(table.c.user_id == user_id)).first()
        me = _to_standing(row) if row else None
    total = session.exec(select(func.count()).select_from(table)).one()
    return top, me, total
