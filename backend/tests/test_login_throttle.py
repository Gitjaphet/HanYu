from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.services.login_throttle import MAX_FAILURES, failure_count, record_failure, retry_after

LI = {"email": "li@example.com", "pseudo": "LiMing", "password": "nihao-2026"}


def register(client: TestClient):
    assert client.post("/auth/register", json=LI).status_code == 201
    client.post("/auth/logout")
    client.cookies.clear()


def login(client: TestClient, email=LI["email"], password=LI["password"]):
    return client.post("/auth/login", json={"email": email, "password": password})


def test_bloque_apres_5_echecs_meme_avec_le_bon_mot_de_passe(client: TestClient):
    register(client)
    for _ in range(MAX_FAILURES):
        assert login(client, password="mauvais-mdp").status_code == 401

    response = login(client)  # le bon mot de passe ne suffit plus pendant le blocage

    assert response.status_code == 429
    assert int(response.headers["Retry-After"]) > 0
    assert response.json()["detail"].startswith("Trop de tentatives")


def test_email_inconnu_bloque_de_la_meme_facon(client: TestClient):
    # Sinon un attaquant saurait quels comptes existent
    for _ in range(MAX_FAILURES):
        assert login(client, email="inconnu@example.com", password="x").status_code == 401

    assert login(client, email="inconnu@example.com", password="x").status_code == 429


def test_majuscules_comptees_ensemble(client: TestClient):
    register(client)
    for _ in range(MAX_FAILURES):
        login(client, email="LI@Example.com", password="mauvais-mdp")

    assert login(client).status_code == 429


def test_une_connexion_reussie_remet_le_compteur_a_zero(client: TestClient, session: Session):
    register(client)
    for _ in range(MAX_FAILURES - 1):
        login(client, password="mauvais-mdp")

    assert login(client).status_code == 200
    assert failure_count(session, LI["email"]) == 0


def test_les_autres_comptes_ne_sont_pas_touches(client: TestClient):
    register(client)
    for _ in range(MAX_FAILURES):
        login(client, email="autre@example.com", password="x")

    assert login(client).status_code == 200


def test_le_blocage_se_leve_apres_15_minutes(session: Session):
    now = datetime.now(UTC)
    for _ in range(MAX_FAILURES):
        record_failure(session, "li@example.com", now=now)

    assert retry_after(session, "li@example.com", now=now) > 0
    assert retry_after(session, "li@example.com", now=now + timedelta(minutes=16)) == 0


def test_les_vieux_echecs_sont_effaces(session: Session):
    old = datetime.now(UTC) - timedelta(days=2)
    record_failure(session, "li@example.com", now=old)

    record_failure(session, "wang@example.com")

    assert failure_count(session, "li@example.com") == 0
