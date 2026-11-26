"""Réinitialisation du mot de passe par lien envoyé par e-mail.

- un jeton aléatoire de 256 bits, valable 30 minutes, utilisable une seule fois ;
- en base, seulement son empreinte SHA-256 (un jeton aussi long ne se devine pas,
  un hachage lent comme Argon2 serait inutile ici et empêcherait la recherche par index) ;
- au plus 3 liens par heure et par compte, pour ne pas inonder une boîte mail.
"""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from sqlmodel import Session, col, delete, func, select, update

from app.core.security import hash_password
from app.models import LoginAttempt, PasswordResetToken, User

TOKEN_TTL = timedelta(minutes=30)
MAX_PER_HOUR = 3
KEEP = timedelta(days=1)  # au-delà, les jetons (utilisés ou expirés) sont effacés


def _hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _aware(value: datetime) -> datetime:
    """SQLite rend les dates sans fuseau : on les considère en UTC."""
    return value if value.tzinfo else value.replace(tzinfo=UTC)


def issue_token(session: Session, user: User, now: datetime | None = None) -> str | None:
    """Crée un lien pour ce compte et renvoie le jeton en clair (à mettre dans l'e-mail).

    None si le compte a déjà reçu 3 liens dans l'heure : on n'envoie alors rien de plus.
    """
    now = now or datetime.now(UTC)
    session.exec(delete(PasswordResetToken).where(PasswordResetToken.created_at < now - KEEP))
    recent = session.exec(
        select(func.count()).where(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.created_at > now - timedelta(hours=1),
        )
    ).one()
    if recent >= MAX_PER_HOUR:
        session.commit()
        return None

    token = secrets.token_urlsafe(32)
    session.add(PasswordResetToken(
        user_id=user.id, token_hash=_hash(token), created_at=now, expires_at=now + TOKEN_TTL,
    ))
    session.commit()
    return token


def find_valid(session: Session, token: str, now: datetime | None = None) -> PasswordResetToken | None:
    """Le jeton s'il existe, n'a pas servi, n'a pas expiré et appartient à un compte actif."""
    now = now or datetime.now(UTC)
    row = session.exec(select(PasswordResetToken).where(PasswordResetToken.token_hash == _hash(token))).first()
    if row is None or row.used_at is not None or _aware(row.expires_at) <= now:
        return None
    user = session.get(User, row.user_id)
    if user is None or not user.is_active:
        return None
    return row


def reset_password(session: Session, token: str, new_password: str, now: datetime | None = None) -> User | None:
    """Change le mot de passe si le jeton est valable. Tout se fait dans une seule transaction :

    - le jeton utilisé et tous les autres liens encore ouverts du compte sont désactivés ;
    - toutes les sessions ouvertes sont révoquées (un voleur connecté est déconnecté) ;
    - les échecs de connexion sont effacés (le compte n'est plus bloqué).
    """
    now = now or datetime.now(UTC)
    row = find_valid(session, token, now)
    if row is None:
        return None

    user = session.get(User, row.user_id)
    user.password_hash = hash_password(new_password)
    user.session_version += 1
    session.add(user)
    session.exec(
        update(PasswordResetToken)
        .where(PasswordResetToken.user_id == user.id, col(PasswordResetToken.used_at).is_(None))
        .values(used_at=now)
    )
    session.exec(delete(LoginAttempt).where(LoginAttempt.email == user.email))
    session.commit()
    session.refresh(user)
    return user
