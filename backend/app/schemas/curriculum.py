"""Structure du cursus (niveaux → unités) pour la navigation du frontend."""

from app.models import Level
from app.schemas.lesson import ApiModel


class UnitOut(ApiModel):
    number: int
    title: str
    lesson_ids: list[int]  # dans l'ordre de l'unité


class LevelOut(ApiModel):
    code: str
    label: str
    subtitle: str
    tag: str
    units: list[UnitOut]


def level_out(level: Level) -> LevelOut:
    return LevelOut(
        code=level.code,
        label=level.label,
        subtitle=level.subtitle,
        tag=level.tag,
        units=[
            UnitOut(number=u.number, title=u.title, lesson_ids=[ls.id for ls in u.lessons])
            for u in level.units
        ],
    )
