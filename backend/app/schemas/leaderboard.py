"""Données de la route /leaderboard : seulement ce qu'on peut montrer à tous (le pseudo, pas l'e-mail)."""

from app.schemas.lesson import ApiModel
from app.services.leaderboard import Standing


class LeaderboardEntry(ApiModel):
    rank: int
    pseudo: str
    xp: int
    stars: int
    lessons: int
    is_me: bool


class LeaderboardOut(ApiModel):
    top: list[LeaderboardEntry]
    me: LeaderboardEntry | None  # la place de l'élève connecté, même s'il n'est pas dans le haut
    total: int                   # nombre d'élèves classés


def entry(standing: Standing, me_id: int | None) -> LeaderboardEntry:
    return LeaderboardEntry(
        rank=standing.rank,
        pseudo=standing.pseudo,
        xp=standing.xp,
        stars=standing.stars,
        lessons=standing.lessons,
        is_me=standing.user_id == me_id,
    )
