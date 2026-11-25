"""Limite des tentatives de connexion par e-mail : 5 échecs en 15 minutes, puis blocage temporaire."""

from datetime import UTC, datetime, timedelta

from sqlmodel import Session, col, delete, func, select

from app.models import LoginAttempt

MAX_FAILURES = 5
WINDOW = timedelta(minutes=15)
KEEP = timedelta(days=1)  # au-delà, les échecs sont effacés (table toujours petite)


def _aware(value: datetime) -> datetime:
    """SQLite rend les dates sans fuseau : on les considère en UTC."""
    return value if value.tzinfo else value.replace(tzinfo=UTC)


def retry_after(session: Session, email: str, now: datetime | None = None) -> int:
    """0 si l'e-mail peut tenter une connexion, sinon le nombre de secondes à attendre."""
    now = now or datetime.now(UTC)
    since = now - WINDOW
    recent = session.exec(
        select(LoginAttempt.created_at)
        .where(LoginAttempt.email == email, LoginAttempt.created_at > since)
        .order_by(col(LoginAttempt.created_at).desc())
        .limit(MAX_FAILURES)
    ).all()
    if len(recent) < MAX_FAILURES:
        return 0
    # Débloqué quand le plus ancien de ces 5 échecs sort de la fenêtre de 15 minutes
    unlock_at = _aware(recent[-1]) + WINDOW
    return max(1, int((unlock_at - now).total_seconds()) + 1)


def record_failure(session: Session, email: str, now: datetime | None = None) -> None:
    now = now or datetime.now(UTC)
    session.add(LoginAttempt(email=email, created_at=now))
    session.exec(delete(LoginAttempt).where(LoginAttempt.created_at < now - KEEP))
    session.commit()


def clear_failures(session: Session, email: str) -> None:
    session.exec(delete(LoginAttempt).where(LoginAttempt.email == email))
    session.commit()


def failure_count(session: Session, email: str) -> int:
    """Utile aux tests et au suivi."""
    return session.exec(select(func.count()).where(LoginAttempt.email == email)).one()
