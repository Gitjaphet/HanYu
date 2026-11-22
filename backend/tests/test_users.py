import pytest
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session

from app.core.security import hash_password, verify_password
from app.models import User


def test_le_mot_de_passe_n_est_jamais_stocke_en_clair():
    h = hash_password("nihao-2026")

    assert "nihao-2026" not in h
    assert h.startswith("$argon2id$")


def test_verification_du_mot_de_passe():
    h = hash_password("nihao-2026")

    assert verify_password("nihao-2026", h)
    assert not verify_password("mauvais", h)


def test_meme_mot_de_passe_deux_empreintes_differentes():
    # Le « sel » aléatoire : deux élèves avec le même mot de passe n'ont pas la même empreinte
    assert hash_password("nihao-2026") != hash_password("nihao-2026")


def make_user(email="li@example.com", pseudo="LiMing") -> User:
    return User(email=email, pseudo=pseudo, password_hash=hash_password("x"))


def test_nouveau_compte_actif_et_sans_privilege(session: Session):
    user = make_user()
    session.add(user)
    session.commit()

    assert user.is_active
    assert not user.is_superadmin
    assert user.created_at is not None


def test_email_unique(session: Session):
    session.add(make_user())
    session.commit()
    session.add(make_user(pseudo="Autre"))
    with pytest.raises(IntegrityError):
        session.commit()


def test_pseudo_unique(session: Session):
    session.add(make_user())
    session.commit()
    session.add(make_user(email="autre@example.com"))
    with pytest.raises(IntegrityError):
        session.commit()
