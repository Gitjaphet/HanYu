"""Charge lessons.json en base. Idempotent : relancer met à jour, sans doublons.

Usage : python -m app.seed.load_lessons [chemin/vers/lessons.json]
"""

import json
import sys
from pathlib import Path

from sqlalchemy import text
from sqlmodel import Session, select

from app.core.db import engine
from app.models import DialogueLine, Lesson, Level, QuizQuestion, Unit, VocabItem
from app.seed.schemas import LessonSeed, SeedFile

DEFAULT_FILE = Path(__file__).with_name("lessons.json")


def load_seed_file(path: Path) -> SeedFile:
    return SeedFile.model_validate(json.loads(path.read_text(encoding="utf-8")))


def _fill_lesson(lesson: Lesson, data: LessonSeed, unit: Unit, position: int) -> None:
    lesson.unit = unit
    lesson.position = position
    for field in ("chinese", "pinyin", "title", "description", "language", "color", "modules"):
        setattr(lesson, field, getattr(data, field))

    # Le contenu de la leçon est remplacé en entier (l'ancien est supprimé par la cascade)
    lesson.vocabulaire = [
        VocabItem(
            position=i, hanzi=v.hanzi, pinyin=v.pinyin, french=v.french, audio_url=v.audioUrl,
            example_hanzi=v.example.hanzi if v.example else None,
            example_pinyin=v.example.pinyin if v.example else None,
            example_french=v.example.french if v.example else None,
        )
        for i, v in enumerate(data.vocabulaire, start=1)
    ]
    lesson.dialogue = [
        DialogueLine(position=i, speaker=d.speaker, hanzi=d.hanzi, pinyin=d.pinyin,
                     french=d.french, audio_url=d.audioUrl)
        for i, d in enumerate(data.dialogue, start=1)
    ]
    lesson.quiz = [
        QuizQuestion(position=i, type=q.type, hanzi=q.hanzi, pinyin=q.pinyin, french=q.french,
                     options=q.options, answer=q.answer)
        for i, q in enumerate(data.quiz, start=1)
    ]


def seed_lessons(session: Session, seed: SeedFile) -> dict[str, int]:
    stats = {"created": 0, "updated": 0}

    for lv in seed.levels:
        level = session.get(Level, lv.code) or Level(code=lv.code)
        level.label, level.subtitle, level.tag, level.position = lv.label, lv.subtitle, lv.tag, lv.position
        session.add(level)

        for u in lv.units:
            unit = session.exec(
                select(Unit).where(Unit.level_code == lv.code, Unit.number == u.number)
            ).first() or Unit(level_code=lv.code, number=u.number)
            unit.title = u.title
            session.add(unit)

            for position, data in enumerate(u.lessons, start=1):
                lesson = session.get(Lesson, data.id)
                stats["updated" if lesson else "created"] += 1
                lesson = lesson or Lesson(id=data.id)
                _fill_lesson(lesson, data, unit, position)
                session.add(lesson)

    session.commit()

    # Les ids ont été imposés : on recale le compteur PostgreSQL, sinon la
    # prochaine leçon créée sans id prendrait l'id 1 (déjà pris)
    if session.get_bind().dialect.name == "postgresql":
        session.connection().execute(text(
            "SELECT setval(pg_get_serial_sequence('lesson', 'id'), (SELECT MAX(id) FROM lesson))"
        ))
        session.commit()

    return stats


def main() -> None:
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_FILE
    seed = load_seed_file(path)
    with Session(engine) as session:
        stats = seed_lessons(session, seed)
    print(f"{path.name} : {stats['created']} leçon(s) créée(s), {stats['updated']} mise(s) à jour")


if __name__ == "__main__":
    main()
