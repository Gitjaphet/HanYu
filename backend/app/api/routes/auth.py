from fastapi import APIRouter, BackgroundTasks, HTTPException, Response, status
from sqlalchemy import func
from sqlmodel import select

from app.api.deps import CurrentUser
from app.core.config import settings
from app.core.db import SessionDep
from app.core.security import (
    SESSION_COOKIE,
    create_session_token,
    hash_password,
    verify_password,
)
from app.models import User
from app.schemas.auth import (
    ForgotPasswordIn,
    LoginIn,
    MessageOut,
    RegisterIn,
    ResetPasswordIn,
    UserOut,
    user_out,
)
from app.services.email import EmailSenderDep
from app.services.login_throttle import clear_failures, record_failure, retry_after
from app.services.password_reset import issue_token, reset_password
from app.services.reset_mail import build_reset_email, reset_link, send_reset_email

# Même réponse que le compte existe ou non : on ne révèle pas qui est inscrit
FORGOT_MESSAGE = "Si un compte existe avec cet e-mail, un lien pour changer le mot de passe vient d'y être envoyé."

router = APIRouter(prefix="/auth", tags=["auth"])


def _open_session(response: Response, user: User) -> None:
    """Dépose le jeton dans un cookie que le JavaScript de la page ne peut pas lire."""
    response.set_cookie(
        SESSION_COOKIE,
        create_session_token(user.id, user.session_version),
        max_age=settings.session_days * 24 * 3600,
        httponly=True,                     # invisible pour JavaScript → protégé du vol par XSS
        secure=settings.is_production,     # HTTPS uniquement en production
        samesite="lax",                    # pas envoyé par les formulaires d'autres sites
        path="/",
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(data: RegisterIn, response: Response, session: SessionDep) -> UserOut:
    if session.exec(select(User).where(User.email == data.email)).first():
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Cet e-mail est déjà utilisé")
    if session.exec(select(User).where(func.lower(User.pseudo) == data.pseudo.lower())).first():
        raise HTTPException(status.HTTP_409_CONFLICT, detail="Ce pseudo est déjà pris")

    user = User(email=data.email, pseudo=data.pseudo, password_hash=hash_password(data.password))
    session.add(user)
    session.commit()
    session.refresh(user)

    _open_session(response, user)
    return user_out(user)


@router.post("/login", response_model=UserOut)
def login(data: LoginIn, response: Response, session: SessionDep) -> UserOut:
    # Trop d'échecs récents pour cet e-mail (qu'il existe ou non) : on refuse sans vérifier
    wait = retry_after(session, data.email)
    if wait:
        minutes = -(-wait // 60)  # arrondi au supérieur
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Trop de tentatives. Réessaie dans {minutes} minute{'s' if minutes > 1 else ''}.",
            headers={"Retry-After": str(wait)},
        )

    user = session.exec(select(User).where(User.email == data.email)).first()
    # Même message et même durée, que l'e-mail existe ou non
    if not verify_password(data.password, user.password_hash if user else None) or not user.is_active:
        record_failure(session, data.email)
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="E-mail ou mot de passe incorrect")

    clear_failures(session, data.email)
    _open_session(response, user)
    return user_out(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(response: Response) -> None:
    response.delete_cookie(SESSION_COOKIE, path="/", secure=settings.is_production,
                           httponly=True, samesite="lax")


@router.post("/logout-others", status_code=status.HTTP_204_NO_CONTENT)
def logout_others(user: CurrentUser, response: Response, session: SessionDep) -> None:
    """Déconnecte tous les autres appareils : les anciens jetons deviennent invalides,
    celui-ci reçoit un nouveau jeton et reste connecté."""
    user.session_version += 1
    session.add(user)
    session.commit()
    _open_session(response, user)


@router.post("/forgot-password", response_model=MessageOut, status_code=status.HTTP_202_ACCEPTED)
def forgot_password(
    data: ForgotPasswordIn, background: BackgroundTasks, session: SessionDep, sender: EmailSenderDep
) -> MessageOut:
    user = session.exec(select(User).where(User.email == data.email)).first()
    if user and user.is_active:
        token = issue_token(session, user)  # None au-delà de 3 liens par heure : rien de plus n'est envoyé
        if token:
            # Envoi après la réponse : la durée de réponse ne trahit pas l'existence du compte
            background.add_task(send_reset_email, sender, build_reset_email(user.email, user.pseudo, reset_link(token)))
    return MessageOut(detail=FORGOT_MESSAGE)


@router.post("/reset-password", response_model=UserOut)
def reset_password_route(data: ResetPasswordIn, response: Response, session: SessionDep) -> UserOut:
    user = reset_password(session, data.token, data.password)
    if user is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail="Ce lien est invalide ou a expiré. Demande-en un nouveau.")
    # Toutes les anciennes sessions sont révoquées ; on connecte directement cet appareil
    _open_session(response, user)
    return user_out(user)


@router.get("/me", response_model=UserOut)
def me(user: CurrentUser) -> UserOut:
    return user_out(user)
