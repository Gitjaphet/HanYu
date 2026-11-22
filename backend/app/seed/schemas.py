"""Format du fichier lessons.json, validé avant tout import."""

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models import QUIZ_TYPES


class SeedModel(BaseModel):
    # Champ inconnu dans le JSON = faute de frappe probable → on refuse
    model_config = ConfigDict(extra="forbid")


class Example(SeedModel):
    hanzi: str
    pinyin: str
    french: str


class VocabSeed(SeedModel):
    hanzi: str
    pinyin: str
    french: str
    audioUrl: str | None = None
    example: Example | None = None


class DialogueSeed(SeedModel):
    speaker: str
    hanzi: str
    pinyin: str
    french: str
    audioUrl: str | None = None


class QuizSeed(SeedModel):
    type: str
    hanzi: str
    pinyin: str
    french: str
    options: list[str] = Field(min_length=2)
    answer: str

    @model_validator(mode="after")
    def check_quiz(self) -> "QuizSeed":
        if self.type not in QUIZ_TYPES:
            raise ValueError(f"type de quiz inconnu : {self.type!r}")
        if self.answer not in self.options:
            raise ValueError(f"la réponse {self.answer!r} n'est pas dans les choix {self.options}")
        if len(set(self.options)) != len(self.options):
            raise ValueError(f"choix en double : {self.options}")
        return self


class LessonSeed(SeedModel):
    id: int = Field(gt=0)
    chinese: str
    pinyin: str
    title: str
    description: str = ""
    language: str = "chinese"
    color: str | None = None
    modules: list[str] = ["vocab", "dialogue", "quiz"]
    vocabulaire: list[VocabSeed]
    dialogue: list[DialogueSeed]
    quiz: list[QuizSeed]


class UnitSeed(SeedModel):
    number: int = Field(gt=0)
    title: str
    lessons: list[LessonSeed]


class LevelSeed(SeedModel):
    code: str = Field(min_length=1, max_length=2)
    label: str
    subtitle: str
    tag: str
    position: int
    units: list[UnitSeed] = []


class SeedFile(SeedModel):
    levels: list[LevelSeed]

    @model_validator(mode="after")
    def check_unique_ids(self) -> "SeedFile":
        ids = [ls.id for lv in self.levels for u in lv.units for ls in u.lessons]
        doubles = sorted({i for i in ids if ids.count(i) > 1})
        if doubles:
            raise ValueError(f"identifiants de leçon en double : {doubles}")
        return self
