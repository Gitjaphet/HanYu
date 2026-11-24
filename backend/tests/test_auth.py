from datetime import UTC, datetime, timedelta

import jwt
from fastapi.testclient import TestClient
from sqlmodel import Session, select

from app.core.config import settings
from app.core.security import JWT_ALGORITHM, SESSION_COOKIE
from app.models import User

LI = {"email": "Li@Example.com", "pseudo": "LiMing", "password": "nihao-2026"}


def register(client: TestClient, **changes) -> object:
    return client.post("/auth/register", json={**LI, **changes})


def test_inscription_cree_un_compte_et_ouvre_la_session(client: TestClient, session: Session):
    response = register(client)

    assert response.status_code == 201
    assert response.json()["email"] == "li@example.com"  # e-mail mis en minuscules
    assert "password" not in response.text and "passwordHash" not in response.json()
    cookie = response.headers["set-cookie"]
    assert SESSION_COOKIE in cookie and "HttpOnly" in cookie and "SameSite=lax" in cookie
    assert client.get("/auth/me").json()["pseudo"] == "LiMing"


def test_inscription_ne_donne_jamais_les_droits_super_admin(client: TestClient, session: Session):
    register(client, isSuperadmin=True)

    assert client.get("/auth/me").json()["isSuperadmin"] is False


def test_email_deja_utilise_meme_en_majuscules(client: TestClient):
    register(client)
    response = register(client, email="LI@EXAMPLE.COM", pseudo="Autre")

    assert response.status_code == 409
    assert response.json()["detail"] == "Cet e-mail est déjà utilisé"


def test_pseudo_deja_pris_sans_tenir_compte_des_majuscules(client: TestClient):
    register(client)
    response = register(client, email="autre@example.com", pseudo="liming")

    assert response.status_code == 409


def test_mot_de_passe_trop_court_refuse(client: TestClient):
    assert register(client, password="court").status_code == 422


def test_connexion_et_deconnexion(client: TestClient):
    register(client)
    client.post("/auth/logout")
    assert client.get("/auth/me").status_code == 401

    response = client.post("/auth/login", json={"email": "LI@example.com", "password": "nihao-2026"})
    assert response.status_code == 200
    assert client.get("/auth/me").status_code == 200


def test_meme_message_si_email_inconnu_ou_mot_de_passe_faux(client: TestClient):
    register(client)
    client.post("/auth/logout")

    wrong_password = client.post("/auth/login", json={"email": LI["email"], "password": "mauvais-mdp"})
    unknown_email = client.post("/auth/login", json={"email": "x@example.com", "password": "mauvais-mdp"})

    assert wrong_password.status_code == unknown_email.status_code == 401
    assert wrong_password.json() == unknown_email.json()


def test_compte_desactive_ne_peut_plus_se_connecter(client: TestClient, session: Session):
    register(client)
    user = session.exec(select(User)).one()
    user.is_active = False
    session.commit()

    assert client.get("/auth/me").status_code == 401
    response = client.post("/auth/login", json={"email": LI["email"], "password": LI["password"]})
    assert response.status_code == 401


def test_jeton_falsifie_ou_expire_refuse(client: TestClient, session: Session):
    register(client)
    user_id = client.get("/auth/me").json()["id"]

    forged = jwt.encode({"sub": str(user_id)}, "une-autre-cle-de-32-caracteres-xx", algorithm=JWT_ALGORITHM)
    client.cookies.clear()
    client.cookies.set(SESSION_COOKIE, forged)
    assert client.get("/auth/me").status_code == 401

    past = datetime.now(UTC) - timedelta(days=1)
    expired = jwt.encode({"sub": str(user_id), "exp": past}, settings.jwt_secret, algorithm=JWT_ALGORITHM)
    client.cookies.clear()
    client.cookies.set(SESSION_COOKIE, expired)
    assert client.get("/auth/me").status_code == 401
