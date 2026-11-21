from fastapi.testclient import TestClient
from sqlmodel import Session


def test_cursus_niveaux_unites_et_lecons(client: TestClient, seeded: Session):
    response = client.get("/curriculum")

    assert response.status_code == 200
    levels = response.json()
    assert [lv["code"] for lv in levels] == ["A", "B", "C"]

    a = levels[0]
    assert a["label"] == "Initiation"
    assert [(u["number"], u["title"]) for u in a["units"]] == [(1, "Les bases"), (2, "Se présenter")]
    assert [u["lessonIds"] for u in a["units"]] == [[1, 2, 3, 4], [5, 6, 7]]


def test_niveau_sans_unite_renvoie_une_liste_vide(client: TestClient, seeded: Session):
    c = client.get("/curriculum").json()[2]

    assert c["tag"] == "Avancé"
    assert c["units"] == []
