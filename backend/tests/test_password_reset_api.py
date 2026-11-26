from urllib.parse import urlsplit

import pytest
from sqlmodel import select

from app.core.security import SESSION_COOKIE, verify_password
from app.main import app
from app.models import PasswordResetToken, User
from app.services.email import ConsoleSender, EmailError, get_email_sender

PASSWORD = "mot-de-passe-1"


@pytest.fixture
def outbox(client):
    """Les e-mails « envoyés » pendant le test, sans rien envoyer pour de vrai."""
    sender = ConsoleSender()
    app.dependency_overrides[get_email_sender] = lambda: sender
    return sender.sent


def register(client, email="eleve@example.com", pseudo="eleve"):
    response = client.post("/auth/register", json={"email": email, "pseudo": pseudo, "password": PASSWORD})
    assert response.status_code == 201
    client.cookies.clear()


def token_from(mail) -> str:
    fragment = urlsplit(mail.text.split("\n\n")[2]).fragment
    assert fragment.startswith("token=")
    return fragment.removeprefix("token=")


def test_meme_reponse_compte_existant_ou_non(client, outbox):
    register(client)
    existing = client.post("/auth/forgot-password", json={"email": "Eleve@Example.com"})
    unknown = client.post("/auth/forgot-password", json={"email": "personne@example.com"})

    assert existing.status_code == unknown.status_code == 202
    assert existing.json() == unknown.json()
    assert [mail.to for mail in outbox] == ["eleve@example.com"]   # un seul e-mail, au vrai compte


def test_le_lien_porte_le_jeton_apres_le_diese(client, outbox):
    register(client)
    client.post("/auth/forgot-password", json={"email": "eleve@example.com"})
    mail = outbox[0]
    assert "/reset-password#token=" in mail.text
    assert token_from(mail) in mail.html


def test_parcours_complet(client, outbox, session):
    register(client)
    old_session = client.post("/auth/login", json={"email": "eleve@example.com", "password": PASSWORD}).cookies[SESSION_COOKIE]
    client.cookies.clear()

    client.post("/auth/forgot-password", json={"email": "eleve@example.com"})
    response = client.post("/auth/reset-password", json={"token": token_from(outbox[0]), "password": "tout-nouveau-mdp"})

    assert response.status_code == 200
    assert response.json()["email"] == "eleve@example.com"
    assert SESSION_COOKIE in response.cookies                      # connecté directement
    user = session.exec(select(User)).one()
    session.refresh(user)
    assert verify_password("tout-nouveau-mdp", user.password_hash)
    # L'ancienne session (ex. un voleur) ne marche plus
    client.cookies.clear()
    client.cookies.set(SESSION_COOKIE, old_session)
    assert client.get("/auth/me").status_code == 401
    # Connexion avec le nouveau mot de passe
    client.cookies.clear()
    assert client.post("/auth/login", json={"email": "eleve@example.com", "password": "tout-nouveau-mdp"}).status_code == 200


def test_lien_utilise_ou_invente_refuse(client, outbox):
    register(client)
    client.post("/auth/forgot-password", json={"email": "eleve@example.com"})
    token = token_from(outbox[0])
    assert client.post("/auth/reset-password", json={"token": token, "password": "nouveau-mdp-1"}).status_code == 200

    reused = client.post("/auth/reset-password", json={"token": token, "password": "nouveau-mdp-2"})
    invented = client.post("/auth/reset-password", json={"token": "x" * 43, "password": "nouveau-mdp-2"})
    assert reused.status_code == invented.status_code == 400
    assert "expiré" in reused.json()["detail"]


def test_mot_de_passe_trop_court_refuse(client, outbox):
    response = client.post("/auth/reset-password", json={"token": "x" * 43, "password": "court"})
    assert response.status_code == 422


def test_au_plus_trois_emails_par_heure(client, outbox, session):
    register(client)
    for _ in range(5):
        assert client.post("/auth/forgot-password", json={"email": "eleve@example.com"}).status_code == 202
    assert len(outbox) == 3
    assert len(session.exec(select(PasswordResetToken)).all()) == 3


def test_panne_de_brevo_ne_casse_pas_la_reponse(client, session, caplog):
    class Broken:
        def send(self, email):
            raise EmailError("Brevo a refusé l'envoi (HTTP 401)")

    app.dependency_overrides[get_email_sender] = lambda: Broken()
    register(client)
    response = client.post("/auth/forgot-password", json={"email": "eleve@example.com"})
    assert response.status_code == 202
    assert "Échec de l'e-mail de réinitialisation" in caplog.text
