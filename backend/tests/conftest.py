from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

import app.models  # noqa: F401  (enregistre les tables pour create_all)
from app.core.db import get_session
from app.main import app


@pytest.fixture
def session() -> Iterator[Session]:
    """Base SQLite en mémoire, neuve pour chaque test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    engine.dispose()


@pytest.fixture
def client(session: Session) -> Iterator[TestClient]:
    """Client de test branché sur la base de test au lieu de PostgreSQL."""
    app.dependency_overrides[get_session] = lambda: session
    with TestClient(app) as client:
        yield client
    app.dependency_overrides.clear()


@pytest.fixture
def seeded(session: Session) -> Session:
    """Base de test remplie avec le vrai lessons.json (10 leçons)."""
    from app.seed.load_lessons import DEFAULT_FILE, load_seed_file, seed_lessons

    seed_lessons(session, load_seed_file(DEFAULT_FILE))
    return session
