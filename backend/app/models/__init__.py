# Importer ce paquet enregistre toutes les tables auprès de SQLModel.metadata
from app.models.lesson import (
    QUIZ_TYPES,
    DialogueLine,
    Lesson,
    Level,
    QuizQuestion,
    Unit,
    VocabItem,
)

__all__ = ["QUIZ_TYPES", "DialogueLine", "Lesson", "Level", "QuizQuestion", "Unit", "VocabItem"]
