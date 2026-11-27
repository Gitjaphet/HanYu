from typing import Annotated

from fastapi import APIRouter, Query

from app.api.deps import OptionalUser
from app.core.db import SessionDep
from app.schemas.leaderboard import LeaderboardOut, entry
from app.services.leaderboard import leaderboard

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=LeaderboardOut)
def get_leaderboard(
    session: SessionDep,
    user: OptionalUser,
    limit: Annotated[int, Query(ge=1, le=50)] = 20,
) -> LeaderboardOut:
    """Ouvert à tous ; un élève connecté y trouve aussi sa propre place."""
    me_id = user.id if user else None
    top, me, total = leaderboard(session, me_id, limit)
    return LeaderboardOut(
        top=[entry(s, me_id) for s in top],
        me=entry(me, me_id) if me else None,
        total=total,
    )
