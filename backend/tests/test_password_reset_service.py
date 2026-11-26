from datetime import UTC, datetime, timedelta

from sqlmodel import Session, select

from app.core.security import hash_password, verify_password
from app.models import LoginAttempt, PasswordResetToken, User
from app.services.password_reset import (
    MAX_PER_HOUR,
    TOKEN_TTL,
    find_valid,
    issue_token,
    reset_password,
)

NOW = datetime(2026, 11, 26, 12, 0, tzinfo=UTC)


def make_user(session: Session, email: str = "eleve@example.com") -> User:
    user = User(email=email, pseudo=email.split("@")[0], password_hash=hash_password("ancien-mdp"))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


def test_seule_l_empreinte_est_stockee(session):
    user = make_user(session)
    token = issue_token(session, user, NOW)

    row = session.exec(select(PasswordResetToken)).one()
    assert len(token) >= 43                      # 256 bits en base64
    assert row.token_hash != token and len(row.token_hash) == 64
    assert row.expires_at.replace(tzinfo=UTC) == NOW + TOKEN_TTL


def test_trois_liens_par_heure_au_plus(session):
    user = make_user(session)
    tokens = [issue_token(session, user, NOW + timedelta(minutes=i)) for i in range(MAX_PER_HOUR + 1)]
    assert all(tokens[:MAX_PER_HOUR]) and tokens[-1] is None
    # Une heure plus tard, c'est de nouveau possible
    assert issue_token(session, user, NOW + timedelta(minutes=61)) is not None


def test_jeton_expire_ou_inconnu_refuse(session):
    user = make_user(session)
    token = issue_token(session, user, NOW)
    assert find_valid(session, token, NOW + TOKEN_TTL - timedelta(seconds=1)) is not None
    assert find_valid(session, token, NOW + TOKEN_TTL) is None
    assert find_valid(session, "jeton-invente", NOW) is None


def test_compte_desactive_refuse(session):
    user = make_user(session)
    token = issue_token(session, user, NOW)
    user.is_active = False
    session.add(user)
    session.commit()
    assert find_valid(session, token, NOW) is None


def test_reinitialisation_complete(session):
    user = make_user(session)
    first = issue_token(session, user, NOW)
    second = issue_token(session, user, NOW + timedelta(minutes=1))
    session.add(LoginAttempt(email=user.email, created_at=NOW))
    session.commit()

    done = reset_password(session, second, "nouveau-mdp-solide", NOW + timedelta(minutes=2))

    assert done is not None
    assert verify_password("nouveau-mdp-solide", done.password_hash)
    assert done.session_version == 1                        # sessions ouvertes révoquées
    assert session.exec(select(LoginAttempt)).all() == []   # compte débloqué
    # Le lien utilisé ET l'autre lien encore ouvert ne servent plus
    assert reset_password(session, second, "autre-mdp-12345", NOW + timedelta(minutes=3)) is None
    assert reset_password(session, first, "autre-mdp-12345", NOW + timedelta(minutes=3)) is None


def test_les_vieux_jetons_sont_effaces(session):
    user = make_user(session)
    issue_token(session, user, NOW)
    issue_token(session, user, NOW + timedelta(days=2))
    assert len(session.exec(select(PasswordResetToken)).all()) == 1


def test_suppression_du_compte_supprime_ses_jetons(session):
    user = make_user(session)
    issue_token(session, user, NOW)
    session.delete(user)
    session.commit()
    assert session.exec(select(PasswordResetToken)).all() == []
