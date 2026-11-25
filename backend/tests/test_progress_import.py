from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session


@pytest.fixture
def student(client: TestClient, seeded: Session) -> TestClient:
    response = client.post(
        "/auth/register", json={"email": "li@example.com", "pseudo": "LiMing", "password": "nihao-2026"}
    )
    assert response.status_code == 201
    return client


def done(lesson_id: int, stars=3, xp=50, completed_at="2026-11-20T10:00:00Z") -> dict:
    return {"lessonId": lesson_id, "vocabDone": True, "dialogueDone": True, "quizDone": True,
            "stars": stars, "xp": xp, "completedAt": completed_at}


def by_lesson(response) -> dict:
    return {p["lessonId"]: p for p in response.json()}


def test_reserve_aux_eleves_connectes(client: TestClient, seeded: Session):
    assert client.post("/progress/import", json={"items": []}).status_code == 401


def test_importe_la_progression_de_l_invite(student: TestClient):
    response = student.post("/progress/import", json={"items": [
        done(1), {"lessonId": 2, "vocabDone": True},
    ]})

    assert response.status_code == 200
    rows = by_lesson(response)
    assert rows[1]["stars"] == 3
    assert rows[2]["vocabDone"] is True and rows[2]["quizDone"] is False


def test_garde_le_meilleur_des_deux(student: TestClient):
    # Sur le serveur : leçon 1 réussie avec 3 étoiles
    for step in ("vocab", "dialogue"):
        student.post(f"/progress/1/{step}")
    student.post("/progress/1/quiz", json={"correct": 5, "wrong": 0})

    # Dans le navigateur : 1 étoile, mais une date plus ancienne
    rows = by_lesson(student.post("/progress/import", json={"items": [
        done(1, stars=1, xp=30, completed_at="2026-11-01T08:00:00Z"),
    ]}))

    assert rows[1]["stars"] == 3
    assert rows[1]["xp"] == 50
    assert rows[1]["completedAt"].startswith("2026-11-01")


def test_respecte_l_ordre_du_cursus(student: TestClient):
    # Leçon 3 « terminée » sans les leçons 1 et 2 : refusée
    rows = by_lesson(student.post("/progress/import", json={"items": [done(3)]}))

    assert 3 not in rows


def test_xp_plafonne_et_date_future_ramenee(student: TestClient):
    future = (datetime.now(UTC) + timedelta(days=30)).isoformat()
    rows = by_lesson(student.post("/progress/import", json={"items": [
        done(1, xp=9999, completed_at=future),
    ]}))

    assert rows[1]["xp"] == 50  # leçon 1 : 5 questions × 10 XP
    completed = datetime.fromisoformat(rows[1]["completedAt"].replace("Z", "+00:00"))
    if completed.tzinfo is None:
        completed = completed.replace(tzinfo=UTC)
    assert completed <= datetime.now(UTC)


def test_lecon_inconnue_ignoree(student: TestClient):
    rows = by_lesson(student.post("/progress/import", json={"items": [done(1), done(999)]}))

    assert set(rows) == {1}


def test_etoiles_impossibles_refusees(student: TestClient):
    assert student.post("/progress/import", json={"items": [done(1, stars=5)]}).status_code == 422


def test_date_sans_fuseau_acceptee(student: TestClient):
    # Une date sans « Z » ni décalage ne doit pas faire planter l'import (considérée en UTC)
    rows = by_lesson(student.post("/progress/import", json={"items": [
        done(1, completed_at="2026-11-20T10:00:00"),
    ]}))

    assert rows[1]["completedAt"].startswith("2026-11-20T10:00")
