from fastapi import APIRouter, Response, status
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import settings
from app.core.db import SessionDep

router = APIRouter(tags=["health"])


@router.get("/health")
def health(session: SessionDep, response: Response) -> dict[str, str]:
    try:
        session.connection().execute(text("SELECT 1"))
        database = "ok"
    except SQLAlchemyError:
        database = "unavailable"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ok" if database == "ok" else "degraded",
        "database": database,
        "app": settings.app_name,
        "environment": settings.environment,
    }
