from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_repond_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_route_inconnue_renvoie_404():
    response = client.get("/route-qui-n-existe-pas")

    assert response.status_code == 404
