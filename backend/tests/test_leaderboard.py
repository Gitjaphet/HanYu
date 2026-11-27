from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.security import hash_password
from app.models import LessonProgress, User


def player(session: Session, pseudo: str, xp_by_lesson: list[int], stars: int = 0, active: bool = True) -> User:
    """Un élève et sa progression, écrits directement en base (plus rapide que de jouer les quiz)."""
    user = User(email=f"{pseudo.lower()}@example.com", pseudo=pseudo, password_hash=hash_password("x" * 12), is_active=active)
    session.add(user)
    session.commit()
    session.refresh(user)
    for lesson_id, xp in enumerate(xp_by_lesson, start=1):
        session.add(LessonProgress(user_id=user.id, lesson_id=lesson_id, vocab_done=True, dialogue_done=True,
                                   quiz_done=True, stars=stars, xp=xp, completed_at=datetime.now(UTC)))
    session.commit()
    return user


@pytest.fixture
def board(seeded: Session) -> Session:
    player(seeded, "Mei", [50, 50])        # 100 XP
    player(seeded, "Bao", [30, 40], 3)     # 70 XP, 6 étoiles
    player(seeded, "Chen", [70], 1)        # 70 XP, 1 étoile
    player(seeded, "Dai", [10])            # 10 XP
    player(seeded, "Zero", [0])            # aucun XP : pas classé
    player(seeded, "Ferme", [500], active=False)  # compte désactivé : pas classé
    return seeded


def test_classement_vide(client: TestClient, seeded: Session):
    assert client.get("/leaderboard").json() == {"top": [], "me": None, "total": 0}


def test_ordre_et_egalites(client: TestClient, board: Session):
    body = client.get("/leaderboard").json()

    assert [(e["rank"], e["pseudo"], e["xp"]) for e in body["top"]] == [
        (1, "Mei", 100),
        (2, "Bao", 70),   # même XP que Chen : même rang, départagés à l'affichage par les étoiles
        (2, "Chen", 70),
        (4, "Dai", 10),
    ]
    assert body["top"][0]["lessons"] == 2
    assert body["total"] == 4
    assert body["me"] is None  # visiteur non connecté


def test_seul_le_pseudo_est_public(client: TestClient, board: Session):
    text = client.get("/leaderboard").text
    assert "@example.com" not in text and "email" not in text.lower()


def test_ma_place_meme_hors_du_haut(client: TestClient, board: Session):
    client.post("/auth/register", json={"email": "moi@example.com", "pseudo": "Moi", "password": "nihao-2026"})
    client.post("/progress/1/vocab")
    client.post("/progress/1/dialogue")
    client.post("/progress/1/quiz", json={"correct": 5, "wrong": 0})  # 50 XP : 4e, derrière Mei, Bao et Chen

    body = client.get("/leaderboard", params={"limit": 2}).json()

    assert [e["pseudo"] for e in body["top"]] == ["Mei", "Bao"]
    assert body["me"]["pseudo"] == "Moi" and body["me"]["rank"] == 4 and body["me"]["isMe"] is True
    assert all(e["isMe"] is False for e in body["top"])


def test_connecte_sans_xp_pas_encore_classe(client: TestClient, board: Session):
    client.post("/auth/register", json={"email": "neuf@example.com", "pseudo": "Neuf", "password": "nihao-2026"})
    assert client.get("/leaderboard").json()["me"] is None


@pytest.mark.parametrize("limit", [0, 51, -1])
def test_limite_bornee(client: TestClient, seeded: Session, limit: int):
    assert client.get("/leaderboard", params={"limit": limit}).status_code == 422
