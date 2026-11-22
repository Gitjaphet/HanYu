"""Mots de passe : hachage Argon2 (jamais stockés en clair, jamais déchiffrables)."""

from pwdlib import PasswordHash

# Argon2id avec les réglages recommandés : lent exprès pour décourager les attaques
_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return _hasher.verify(password, password_hash)
