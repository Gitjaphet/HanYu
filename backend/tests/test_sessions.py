from datetime import UTC, datetime, timedelta

import jwt
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import JWT_ALGORITHM, SESSION_COOKIE
from app.models import User

LI = {"email": "li@example.com", "pseudo": "LiMing", "password": "nihao-2026"}


def connect(client: TestClient) -> str:
    """Se connecte et renvoie le jeton de session de cet « appareil »."""
    client.cookies.clear()
    response = client.post("/auth/login", json={"email": LI["email"], "password": LI["password"]})
    assert response.status_code == 200
    return client.cookies.get(SESSION_COOKIE)


def use(client: TestClient, token: str):
    client.cookies.clear()
    client.cookies.set(SESSION_COOKIE, token)
    return client.get("/auth/me")


def test_ancien_jeton_sans_version_toujours_accepte(client: TestClient, session: Session):
    # Jetons émis avant cette mise à jour : personne n'est déconnecté au déploiement
    client.post("/auth/register", json=LI)
    user = session.exec(select(User)).one()
    now = datetime.now(UTC)
    legacy = jwt.encode({"sub": str(user.id), "iat": now, "exp": now + timedelta(days=1)},
                        settings.jwt_secret, algorithm=JWT_ALGORITHM)

    assert use(client, legacy).status_code == 200


def test_deconnecter_les_autres_appareils(client: TestClient):
    client.post("/auth/register", json=LI)
    telephone = connect(client)
    ordinateur = connect(client)

    client.cookies.clear()
    client.cookies.set(SESSION_COOKIE, ordinateur)
    response = client.post("/auth/logout-others")
    assert response.status_code == 204
    ordinateur_apres = response.cookies.get(SESSION_COOKIE)  # nouveau jeton pour cet appareil

    assert use(client, telephone).status_code == 401        # l'autre appareil est déconnecté
    assert use(client, ordinateur).status_code == 401       # l'ancien jeton aussi
    assert use(client, ordinateur_apres).status_code == 200  # cet appareil reste connecté


def test_reserve_aux_comptes_connectes(client: TestClient):
    assert client.post("/auth/logout-others").status_code == 401
