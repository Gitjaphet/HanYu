import pytest
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.models import DialogueLine, Lesson, Level, QuizQuestion, Unit, VocabItem


def make_lesson(session: Session) -> Lesson:
    level = Level(code="A", label="Initiation", subtitle="Premiers pas", tag="Débutant", position=1)
    unit = Unit(level=level, number=1, title="Les bases")
    lesson = Lesson(id=1, unit=unit, position=1, chinese="问候", pinyin="wèn hòu", title="Salutations")
    session.add(lesson)
    session.commit()
    return lesson


def test_vocabulaire_lu_dans_l_ordre_des_positions(session: Session):
    lesson = make_lesson(session)
    # Ajoutés dans le désordre exprès
    lesson.vocabulaire = [
        VocabItem(position=2, hanzi="再见", pinyin="zài jiàn", french="Au revoir"),
        VocabItem(position=1, hanzi="你好", pinyin="nǐ hǎo", french="Bonjour"),
    ]
    session.commit()
    session.expire_all()

    reloaded = session.get(Lesson, 1)
    assert [v.hanzi for v in reloaded.vocabulaire] == ["你好", "再见"]
    assert reloaded.unit.level.label == "Initiation"


def test_supprimer_une_lecon_supprime_son_contenu(session: Session):
    lesson = make_lesson(session)
    lesson.dialogue = [DialogueLine(position=1, speaker="A", hanzi="你好！", pinyin="Nǐ hǎo!", french="Bonjour !")]
    session.commit()

    session.delete(lesson)
    session.commit()

    assert session.exec(select(DialogueLine)).all() == []


def test_type_de_quiz_inconnu_refuse(session: Session):
    lesson = make_lesson(session)
    lesson.quiz = [
        QuizQuestion(position=1, type="n-importe-quoi", hanzi="你好", pinyin="nǐ hǎo",
                     french="Bonjour", options=["Bonjour", "Merci", "Oui", "Non"], answer="Bonjour")
    ]
    with pytest.raises(IntegrityError):
        session.commit()


def test_deux_unites_avec_le_meme_numero_dans_un_niveau_refusees(session: Session):
    make_lesson(session)
    session.add(Unit(level_code="A", number=1, title="Doublon"))
    with pytest.raises(IntegrityError):
        session.commit()
