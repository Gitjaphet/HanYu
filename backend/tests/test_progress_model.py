import pytest
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, select

from app.core.security import hash_password
from app.models import LessonProgress, User


@pytest.fixture
def student(seeded: Session) -> User:
    user = User(email="li@example.com", pseudo="LiMing", password_hash=hash_password("x"))
    seeded.add(user)
    seeded.commit()
    return user


def test_progression_vide_par_defaut(seeded: Session, student: User):
    progress = LessonProgress(user_id=student.id, lesson_id=1)
    seeded.add(progress)
    seeded.commit()

    assert not (progress.vocab_done or progress.dialogue_done or progress.quiz_done)
    assert progress.stars == 0
    assert progress.xp == 0
    assert progress.completed_at is None
    assert progress.updated_at is not None


def test_une_seule_ligne_par_eleve_et_par_lecon(seeded: Session, student: User):
    seeded.add(LessonProgress(user_id=student.id, lesson_id=1))
    seeded.commit()
    seeded.add(LessonProgress(user_id=student.id, lesson_id=1))
    with pytest.raises(IntegrityError):
        seeded.commit()


@pytest.mark.parametrize("stars", [-1, 4])
def test_etoiles_entre_0_et_3(seeded: Session, student: User, stars: int):
    seeded.add(LessonProgress(user_id=student.id, lesson_id=1, stars=stars))
    with pytest.raises(IntegrityError):
        seeded.commit()


def test_lecon_inconnue_refusee(seeded: Session, student: User):
    seeded.add(LessonProgress(user_id=student.id, lesson_id=999))
    with pytest.raises(IntegrityError):
        seeded.commit()


def test_supprimer_le_compte_supprime_sa_progression(seeded: Session, student: User):
    seeded.add(LessonProgress(user_id=student.id, lesson_id=1))
    seeded.commit()

    seeded.delete(student)
    seeded.commit()

    assert seeded.exec(select(LessonProgress)).all() == []
