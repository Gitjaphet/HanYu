import io
import json
import urllib.error

import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.services import email as email_module
from app.services.email import BREVO_URL, BrevoSender, ConsoleSender, Email, EmailError

KEY = "xkeysib-test-0123456789"
MESSAGE = Email(to="eleve@example.com", subject="Sujet", text="Bonjour", html="<p>Bonjour</p>")


class FakeResponse:
    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False


def capture_urlopen(monkeypatch):
    """Remplace l'appel réseau : on garde la requête au lieu de l'envoyer."""
    calls = []

    def fake_urlopen(request, timeout):
        calls.append((request, timeout))
        return FakeResponse()

    monkeypatch.setattr(email_module.urllib.request, "urlopen", fake_urlopen)
    return calls


def test_console_garde_les_emails():
    sender = ConsoleSender()
    sender.send(MESSAGE)
    assert sender.sent == [MESSAGE]


def test_brevo_envoie_la_bonne_requete(monkeypatch):
    calls = capture_urlopen(monkeypatch)
    BrevoSender(KEY, "no-reply@medevstack.com", "HanYu").send(MESSAGE)

    request, timeout = calls[0]
    assert request.full_url == BREVO_URL
    assert request.get_method() == "POST"
    assert request.get_header("Api-key") == KEY
    assert timeout == 10.0
    assert json.loads(request.data) == {
        "sender": {"email": "no-reply@medevstack.com", "name": "HanYu"},
        "to": [{"email": "eleve@example.com"}],
        "subject": "Sujet",
        "textContent": "Bonjour",
        "htmlContent": "<p>Bonjour</p>",
    }


def test_brevo_sans_html(monkeypatch):
    calls = capture_urlopen(monkeypatch)
    BrevoSender(KEY, "a@b.c", "X").send(Email(to="e@x.com", subject="S", text="T"))
    assert "htmlContent" not in json.loads(calls[0][0].data)


def test_brevo_refus_devient_email_error_sans_fuite_de_cle(monkeypatch):
    def refuse(request, timeout):
        raise urllib.error.HTTPError(BREVO_URL, 401, "Unauthorized", {}, io.BytesIO(b'{"code":"unauthorized"}'))

    monkeypatch.setattr(email_module.urllib.request, "urlopen", refuse)
    with pytest.raises(EmailError) as error:
        BrevoSender(KEY, "a@b.c", "X").send(MESSAGE)
    assert "401" in str(error.value)
    assert KEY not in str(error.value)


def test_brevo_injoignable_devient_email_error(monkeypatch):
    def coupe(request, timeout):
        raise urllib.error.URLError("network unreachable")

    monkeypatch.setattr(email_module.urllib.request, "urlopen", coupe)
    with pytest.raises(EmailError, match="injoignable"):
        BrevoSender(KEY, "a@b.c", "X").send(MESSAGE)


def test_production_exige_une_cle_brevo():
    with pytest.raises(ValidationError, match="BREVO_API_KEY"):
        Settings(_env_file=None, environment="production", jwt_secret="s" * 32, brevo_api_key="")
    assert Settings(_env_file=None, environment="production", jwt_secret="s" * 32, brevo_api_key=KEY)
