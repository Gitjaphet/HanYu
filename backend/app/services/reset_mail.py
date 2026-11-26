"""Contenu et envoi de l'e-mail « réinitialise ton mot de passe »."""

import html
import logging

from app.core.config import settings
from app.services.email import Email, EmailError, EmailSender
from app.services.password_reset import TOKEN_TTL

log = logging.getLogger("hanyu.email")


def reset_link(token: str) -> str:
    # Jeton après « # » : le navigateur ne l'envoie jamais au serveur, il n'apparaît donc
    # ni dans les journaux de Traefik ni dans ceux de Next.js. La page le lit elle-même.
    return f"{settings.frontend_url}/reset-password#token={token}"


def build_reset_email(to: str, pseudo: str, link: str) -> Email:
    minutes = int(TOKEN_TTL.total_seconds() // 60)
    text = (
        f"Bonjour {pseudo},\n\n"
        "Tu as demandé à changer ton mot de passe HanYu. Ouvre ce lien pour en choisir un nouveau :\n\n"
        f"{link}\n\n"
        f"Ce lien ne fonctionne qu'une fois et expire dans {minutes} minutes.\n"
        "Si tu n'es pas à l'origine de cette demande, ignore cet e-mail : ton mot de passe ne change pas.\n\n"
        "— HanYu"
    )
    safe_link, safe_pseudo = html.escape(link, quote=True), html.escape(pseudo)
    body = f"""\
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#2F3558;line-height:1.5">
  <h1 style="font-size:20px;color:#5A69B0">Nouveau mot de passe</h1>
  <p>Bonjour {safe_pseudo},</p>
  <p>Tu as demandé à changer ton mot de passe HanYu.</p>
  <p style="margin:28px 0">
    <a href="{safe_link}" style="background:#5A69B0;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:bold">Choisir un nouveau mot de passe</a>
  </p>
  <p style="font-size:14px;color:#62688A">Ce lien ne fonctionne qu'une fois et expire dans {minutes} minutes.<br>
  Si tu n'es pas à l'origine de cette demande, ignore cet e-mail : ton mot de passe ne change pas.</p>
  <p style="font-size:12px;color:#62688A;word-break:break-all">Si le bouton ne marche pas, copie ce lien : {safe_link}</p>
</div>"""
    return Email(to=to, subject="Ton nouveau mot de passe HanYu", text=text, html=body)


def send_reset_email(sender: EmailSender, email: Email) -> None:
    """Tâche de fond : un échec d'envoi est journalisé, jamais montré à l'utilisateur
    (la réponse est toujours la même, pour ne pas révéler quels comptes existent)."""
    try:
        sender.send(email)
    except EmailError as exc:
        log.error("Échec de l'e-mail de réinitialisation pour %s : %s", email.to, exc)
