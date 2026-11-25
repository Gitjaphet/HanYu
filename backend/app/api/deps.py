"""Dépendances partagées par les routes : « qui est connecté ? »."""

from typing import Annotated

from fastapi import Cookie, Depends, HTTPException, status

from app.core.db import SessionDep
from app.core.security import SESSION_COOKIE, read_session_token
from app.models import User

NOT_AUTHENTICATED = HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Non connecté")


def get_current_user(
    session: SessionDep,
    token: Annotated[str | None, Cookie(alias=SESSION_COOKIE)] = None,
) -> User:
    claims = read_session_token(token) if token else None
    user = session.get(User, claims.user_id) if claims else None
    # Version différente : la session a été révoquée (« déconnecter les autres appareils »)
    if user is None or not user.is_active or user.session_version != claims.version:
        raise NOT_AUTHENTICATED
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
