from fastapi import APIRouter, HTTPException, status
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.db import SessionDep
from app.models import Lesson, Level, Unit
from app.schemas.lesson import LessonOut, lesson_out

router = APIRouter(prefix="/lessons", tags=["lessons"])

# Charge l'unité et tout le contenu en requêtes groupées,
# au lieu d'une requête par leçon et par partie (problème « N+1 »)
WITH_CONTENT = (
    selectinload(Lesson.unit),
    selectinload(Lesson.vocabulaire),
    selectinload(Lesson.dialogue),
    selectinload(Lesson.quiz),
)


@router.get("", response_model=list[LessonOut], response_model_exclude_none=True)
def list_lessons(session: SessionDep) -> list[LessonOut]:
    """Toutes les leçons, dans l'ordre du cursus (niveau, puis unité, puis leçon)."""
    statement = (
        select(Lesson)
        .join(Unit)
        .join(Level)
        .order_by(Level.position, Unit.number, Lesson.position)
        .options(*WITH_CONTENT)
    )
    return [lesson_out(lesson) for lesson in session.exec(statement).all()]


@router.get("/{lesson_id}", response_model=LessonOut, response_model_exclude_none=True)
def get_lesson(lesson_id: int, session: SessionDep) -> LessonOut:
    lesson = session.exec(select(Lesson).where(Lesson.id == lesson_id).options(*WITH_CONTENT)).first()
    if lesson is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Leçon introuvable")
    return lesson_out(lesson)
