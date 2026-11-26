"""Envoi des e-mails transactionnels (réinitialisation de mot de passe, …).

Le reste de l'application ne connaît que `EmailSender.send(Email)` : on peut changer
de prestataire, ou tester sans rien envoyer, sans toucher aux routes.
"""

import json
import logging
import urllib.error
import urllib.request
from dataclasses import dataclass
from functools import lru_cache
from typing import Annotated, Protocol

from fastapi import Depends

from app.core.config import settings

log = logging.getLogger("hanyu.email")

BREVO_URL = "https://api.brevo.com/v3/smtp/email"


@dataclass(frozen=True)
class Email:
    to: str
    subject: str
    text: str
    html: str | None = None


class EmailError(Exception):
    """L'e-mail n'a pas pu être remis au prestataire."""


class EmailSender(Protocol):
    def send(self, email: Email) -> None: ...


class ConsoleSender:
    """Développement et tests : n'envoie rien, garde les e-mails et les affiche dans les logs."""

    def __init__(self) -> None:
        self.sent: list[Email] = []

    def send(self, email: Email) -> None:
        self.sent.append(email)
        log.warning("E-mail NON envoyé (pas de BREVO_API_KEY) → %s : %s\n%s", email.to, email.subject, email.text)


class BrevoSender:
    """Envoi réel par l'API transactionnelle de Brevo (bibliothèque standard, aucune dépendance)."""

    def __init__(self, api_key: str, from_email: str, from_name: str, timeout: float = 10.0) -> None:
        self._api_key = api_key
        self._sender = {"email": from_email, "name": from_name}
        self._timeout = timeout

    def payload(self, email: Email) -> dict:
        body = {
            "sender": self._sender,
            "to": [{"email": email.to}],
            "subject": email.subject,
            "textContent": email.text,
        }
        if email.html:
            body["htmlContent"] = email.html
        return body

    def send(self, email: Email) -> None:
        request = urllib.request.Request(
            BREVO_URL,
            data=json.dumps(self.payload(email)).encode(),
            method="POST",
            headers={
                "api-key": self._api_key,
                "content-type": "application/json",
                "accept": "application/json",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=self._timeout):
                pass  # 2xx : Brevo a accepté l'e-mail
        except urllib.error.HTTPError as exc:
            # 401 = clé invalide, expirée ou IP non autorisée ; 400 = e-mail mal formé
            detail = exc.read(500).decode(errors="replace")
            raise EmailError(f"Brevo a refusé l'envoi (HTTP {exc.code}) : {detail}") from exc
        except (urllib.error.URLError, TimeoutError) as exc:
            raise EmailError(f"Brevo injoignable : {exc}") from exc


@lru_cache
def get_email_sender() -> EmailSender:
    if settings.brevo_api_key:
        return BrevoSender(settings.brevo_api_key, settings.mail_from_email, settings.mail_from_name)
    return ConsoleSender()


# À utiliser dans les routes ; les tests le remplacent par un ConsoleSender
EmailSenderDep = Annotated[EmailSender, Depends(get_email_sender)]
