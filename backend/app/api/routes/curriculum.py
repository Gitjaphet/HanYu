from fastapi import APIRouter
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.core.db import SessionDep
from app.models import Level, Unit
from app.schemas.curriculum import LevelOut, level_out

router = APIRouter(prefix="/curriculum", tags=["curriculum"])


@router.get("", response_model=list[LevelOut])
def get_curriculum(session: SessionDep) -> list[LevelOut]:
    """Niveaux → unités → identifiants des leçons, sans le contenu (léger, pour les menus)."""
    statement = (
        select(Level)
        .order_by(Level.position)
        .options(selectinload(Level.units).selectinload(Unit.lessons))
    )
    return [level_out(level) for level in session.exec(statement).all()]
