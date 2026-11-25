"""Sécurité : mots de passe (Argon2) et jetons de session (JWT signé)."""

from datetime import UTC, datetime, timedelta
from typing import NamedTuple

import jwt
from pwdlib import PasswordHash

from app.core.config import settings

# Argon2id avec les réglages recommandés : lent exprès pour décourager les attaques
_hasher = PasswordHash.recommended()

# Empreinte d'un mot de passe quelconque : sert à vérifier « pour rien » quand l'e-mail
# n'existe pas, pour que la réponse prenne le même temps (on ne révèle pas qui est inscrit)
_DUMMY_HASH = _hasher.hash("hanyu-mot-de-passe-factice")

JWT_ALGORITHM = "HS256"
SESSION_COOKIE = "hanyu_session"


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str | None) -> bool:
    if password_hash is None:
        _hasher.verify(password, _DUMMY_HASH)
        return False
    return _hasher.verify(password, password_hash)


class SessionClaims(NamedTuple):
    user_id: int
    version: int  # numéro de version des sessions du compte au moment de la connexion


def create_session_token(user_id: int, version: int) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "ver": version,
        "iat": now,
        "exp": now + timedelta(days=settings.session_days),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM)


def read_session_token(token: str) -> SessionClaims | None:
    """Compte et version si le jeton est authentique et non expiré, sinon None."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[JWT_ALGORITHM])
        # Jetons émis avant l'ajout des versions : considérés comme version 0
        return SessionClaims(int(payload["sub"]), int(payload.get("ver", 0)))
    except (jwt.InvalidTokenError, KeyError, ValueError, TypeError):
        return None
