from fastapi.testclient import TestClient
from sqlmodel import Session

# Les clés du type `Lesson` du frontend (types/index.ts), sauf `status` qui vient de la progression
LESSON_KEYS = {"id", "levelId", "unitId", "unitTitle", "chinese", "pinyin", "title", "description",
               "language", "modules", "color", "vocabulaire", "dialogue", "quiz"}


def test_liste_dans_l_ordre_du_cursus(client: TestClient, seeded: Session):
    response = client.get("/lessons")

    assert response.status_code == 200
    lessons = response.json()
    assert [l["id"] for l in lessons] == list(range(1, 11))
    assert [(l["levelId"], l["unitId"]) for l in lessons][:5] == [("A", 1)] * 4 + [("A", 2)]


def test_detail_au_format_du_frontend(client: TestClient, seeded: Session):
    lesson = client.get("/lessons/1").json()

    assert set(lesson) == LESSON_KEYS
    assert lesson["unitTitle"] == "Les bases"
    assert lesson["vocabulaire"][0]["hanzi"] == "你好"
    assert lesson["vocabulaire"][0]["example"]["french"] == "Bonjour, je m'appelle Li Ming."
    assert "audioUrl" not in lesson["vocabulaire"][0]  # absent plutôt que null, comme en TypeScript
    assert lesson["quiz"][0]["answer"] in lesson["quiz"][0]["options"]


def test_lecon_inconnue_renvoie_404(client: TestClient, seeded: Session):
    response = client.get("/lessons/999")

    assert response.status_code == 404
    assert response.json() == {"detail": "Leçon introuvable"}


def test_identifiant_non_numerique_renvoie_422(client: TestClient):
    assert client.get("/lessons/abc").status_code == 422
