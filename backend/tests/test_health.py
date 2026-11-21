from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine

from app.core.db import get_session
from app.main import app


def test_health_repond_ok(client: TestClient):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["database"] == "ok"


def test_health_signale_une_base_injoignable():
    # Un port où aucune base n'écoute : la connexion échoue
    broken = create_engine("postgresql+psycopg://x:x@127.0.0.1:1/x")
    app.dependency_overrides[get_session] = lambda: Session(broken)
    try:
        response = TestClient(app).get("/health")
    finally:
        app.dependency_overrides.clear()
        broken.dispose()

    assert response.status_code == 503
    assert response.json()["database"] == "unavailable"


def test_route_inconnue_renvoie_404(client: TestClient):
    response = client.get("/route-qui-n-existe-pas")

    assert response.status_code == 404
