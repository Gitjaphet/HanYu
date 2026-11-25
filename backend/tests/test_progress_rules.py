import pytest

from app.services.progress import quiz_stars


@pytest.mark.parametrize(("correct", "total", "failed", "stars"), [
    (5, 5, False, 3),   # sans faute
    (4, 5, False, 2),   # 80 %
    (3, 5, False, 1),   # 60 % : réussi
    (5, 5, True, 0),    # raté : plus de cœurs
    (0, 0, False, 0),   # quiz vide
])
def test_quiz_stars_comme_le_frontend(correct, total, failed, stars):
    assert quiz_stars(correct, total, failed) == stars
