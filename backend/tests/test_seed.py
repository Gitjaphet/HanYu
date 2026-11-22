import pytest
from pydantic import ValidationError
from sqlmodel import Session, func, select

from app.models import Lesson, QuizQuestion, Unit, VocabItem
from app.seed.load_lessons import DEFAULT_FILE, load_seed_file, seed_lessons
from app.seed.schemas import SeedFile

QUIZ = {"type": "hanzi-to-french", "hanzi": "你好", "pinyin": "nǐ hǎo", "french": "Bonjour",
        "options": ["Bonjour", "Merci", "Oui", "Non"], "answer": "Bonjour"}


def sample(title: str = "Salutations") -> SeedFile:
    return SeedFile.model_validate({"levels": [{
        "code": "A", "label": "Initiation", "subtitle": "Premiers pas", "tag": "Débutant", "position": 1,
        "units": [{"number": 1, "title": "Les bases", "lessons": [{
            "id": 7, "chinese": "问候", "pinyin": "wèn hòu", "title": title,
            "vocabulaire": [{"hanzi": "你好", "pinyin": "nǐ hǎo", "french": "Bonjour",
                             "example": {"hanzi": "你好！", "pinyin": "Nǐ hǎo!", "french": "Bonjour !"}}],
            "dialogue": [{"speaker": "A", "hanzi": "你好！", "pinyin": "Nǐ hǎo!", "french": "Bonjour !"}],
            "quiz": [QUIZ],
        }]}],
    }]})


def count(session: Session, model) -> int:
    return session.exec(select(func.count()).select_from(model)).one()


def test_import_conserve_l_identifiant_et_le_contenu(session: Session):
    seed_lessons(session, sample())

    lesson = session.get(Lesson, 7)
    assert lesson.title == "Salutations"
    assert lesson.unit.title == "Les bases"
    assert lesson.vocabulaire[0].example_french == "Bonjour !"


def test_relancer_l_import_ne_cree_pas_de_doublons(session: Session):
    seed_lessons(session, sample())
    stats = seed_lessons(session, sample(title="Salutations (v2)"))

    assert stats == {"created": 0, "updated": 1}
    assert session.get(Lesson, 7).title == "Salutations (v2)"
    assert count(session, Lesson) == 1
    assert count(session, Unit) == 1
    assert count(session, VocabItem) == 1
    assert count(session, QuizQuestion) == 1


def test_reponse_absente_des_choix_refusee():
    with pytest.raises(ValidationError, match="n'est pas dans les choix"):
        SeedFile.model_validate({"levels": [{
            "code": "A", "label": "x", "subtitle": "x", "tag": "x", "position": 1,
            "units": [{"number": 1, "title": "x", "lessons": [{
                "id": 1, "chinese": "x", "pinyin": "x", "title": "x", "vocabulaire": [], "dialogue": [],
                "quiz": [{**QUIZ, "answer": "Au revoir"}],
            }]}],
        }]})


def test_le_vrai_fichier_lessons_json_est_valide():
    seed = load_seed_file(DEFAULT_FILE)
    lessons = [ls for lv in seed.levels for u in lv.units for ls in u.lessons]
    assert len(lessons) == 10
    assert [ls.id for ls in lessons] == list(range(1, 11))
