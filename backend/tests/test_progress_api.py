import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session


def login(client: TestClient, email="li@example.com", pseudo="LiMing"):
    response = client.post("/auth/register", json={"email": email, "pseudo": pseudo, "password": "nihao-2026"})
    assert response.status_code == 201


@pytest.fixture
def student(client: TestClient, seeded: Session) -> TestClient:
    """Client connecté, base remplie avec les 10 leçons (leçon 1 : 5 questions de quiz)."""
    login(client)
    return client


def finish_lesson(client: TestClient, lesson_id: int, correct: int, wrong: int = 0):
    client.post(f"/progress/{lesson_id}/vocab")
    client.post(f"/progress/{lesson_id}/dialogue")
    return client.post(f"/progress/{lesson_id}/quiz", json={"correct": correct, "wrong": wrong})


def test_reservé_aux_eleves_connectes(client: TestClient, seeded: Session):
    assert client.get("/progress").status_code == 401
    assert client.post("/progress/1/vocab").status_code == 401


def test_progression_vide_au_depart(student: TestClient):
    assert student.get("/progress").json() == []


def test_les_etapes_s_enregistrent(student: TestClient):
    response = student.post("/progress/1/vocab")

    assert response.status_code == 200
    assert response.json()["vocabDone"] is True
    assert student.get("/progress").json()[0]["lessonId"] == 1


def test_les_etapes_se_font_dans_l_ordre(student: TestClient):
    response = student.post("/progress/1/dialogue")

    assert response.status_code == 409
    assert response.json()["detail"] == "Termine d'abord le vocabulaire"


def test_lecon_suivante_verrouillee(student: TestClient):
    assert student.post("/progress/2/vocab").status_code == 403


def test_lecon_inconnue(student: TestClient):
    assert student.post("/progress/999/vocab").status_code == 404


def test_quiz_sans_faute_trois_etoiles(student: TestClient):
    body = finish_lesson(student, 1, correct=5).json()

    assert body["quizDone"] is True
    assert body["stars"] == 3
    assert body["xp"] == 50
    assert body["completedAt"] is not None
    # … et la leçon 2 est débloquée
    assert student.post("/progress/2/vocab").status_code == 200


def test_quiz_rate_ne_valide_pas_la_lecon(student: TestClient):
    body = finish_lesson(student, 1, correct=1, wrong=3).json()

    assert body["quizDone"] is False
    assert body["stars"] == 0
    assert student.post("/progress/2/vocab").status_code == 403


def test_rejouer_garde_le_meilleur_score_et_la_premiere_date(student: TestClient):
    first = finish_lesson(student, 1, correct=5).json()
    again = student.post("/progress/1/quiz", json={"correct": 3, "wrong": 2}).json()

    assert again["stars"] == 3
    assert again["xp"] == 50
    assert again["completedAt"] == first["completedAt"]


@pytest.mark.parametrize("result", [
    {"correct": 6, "wrong": 0},   # plus de réponses que de questions
    {"correct": 3, "wrong": 0},   # quiz réussi mais incomplet
    {"correct": 0, "wrong": 4},   # plus de 3 cœurs perdus
    {"correct": -1, "wrong": 0},
])
def test_resultat_de_quiz_incoherent_refuse(student: TestClient, result: dict):
    student.post("/progress/1/vocab")
    student.post("/progress/1/dialogue")

    assert student.post("/progress/1/quiz", json=result).status_code == 422


def test_chaque_eleve_ne_voit_que_sa_progression(student: TestClient):
    finish_lesson(student, 1, correct=5)
    student.post("/auth/logout")
    student.cookies.clear()
    login(student, email="wang@example.com", pseudo="Wang")

    assert student.get("/progress").json() == []
