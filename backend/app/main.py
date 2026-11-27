from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, curriculum, health, leaderboard, lessons, progress
from app.core.config import settings

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(lessons.router)
app.include_router(curriculum.router)
app.include_router(auth.router)
app.include_router(progress.router)
app.include_router(leaderboard.router)
