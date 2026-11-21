"""Contenu pédagogique : niveaux → unités → leçons → vocabulaire, dialogue, quiz."""

from sqlalchemy import JSON, CheckConstraint, UniqueConstraint
from sqlmodel import Field, Relationship, SQLModel

QUIZ_TYPES = ("hanzi-to-french", "french-to-hanzi", "pinyin-to-hanzi", "audio")


class Level(SQLModel, table=True):
    code: str = Field(primary_key=True, max_length=2)  # "A", "B", "C"
    label: str = Field(max_length=50)  # "Initiation"
    subtitle: str = Field(max_length=120)
    tag: str = Field(max_length=30)  # "Débutant"
    position: int

    units: list["Unit"] = Relationship(
        back_populates="level", sa_relationship_kwargs={"order_by": "Unit.number"}
    )


class Unit(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("level_code", "number", name="uq_unit_level_number"),)

    id: int | None = Field(default=None, primary_key=True)
    level_code: str = Field(foreign_key="level.code", index=True)
    number: int  # numéro de l'unité dans son niveau : 1, 2…
    title: str = Field(max_length=100)  # "Les bases"

    level: Level = Relationship(back_populates="units")
    lessons: list["Lesson"] = Relationship(
        back_populates="unit", sa_relationship_kwargs={"order_by": "Lesson.position"}
    )


class Lesson(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    unit_id: int = Field(foreign_key="unit.id", index=True)
    position: int  # ordre dans l'unité
    chinese: str = Field(max_length=20)  # "问候"
    pinyin: str = Field(max_length=60)
    title: str = Field(max_length=100)
    description: str = Field(default="", max_length=300)
    language: str = Field(default="chinese", max_length=20)
    color: str | None = Field(default=None, max_length=50)
    modules: list[str] = Field(default_factory=lambda: ["vocab", "dialogue", "quiz"], sa_type=JSON)

    unit: Unit = Relationship(back_populates="lessons")
    vocabulaire: list["VocabItem"] = Relationship(
        back_populates="lesson",
        sa_relationship_kwargs={"order_by": "VocabItem.position", "cascade": "all, delete-orphan"},
    )
    dialogue: list["DialogueLine"] = Relationship(
        back_populates="lesson",
        sa_relationship_kwargs={"order_by": "DialogueLine.position", "cascade": "all, delete-orphan"},
    )
    quiz: list["QuizQuestion"] = Relationship(
        back_populates="lesson",
        sa_relationship_kwargs={"order_by": "QuizQuestion.position", "cascade": "all, delete-orphan"},
    )


class VocabItem(SQLModel, table=True):
    __tablename__ = "vocab_item"

    id: int | None = Field(default=None, primary_key=True)
    lesson_id: int = Field(foreign_key="lesson.id", index=True, ondelete="CASCADE")
    position: int
    hanzi: str = Field(max_length=30)
    pinyin: str = Field(max_length=80)
    french: str = Field(max_length=120)
    audio_url: str | None = Field(default=None, max_length=300)
    example_hanzi: str | None = Field(default=None, max_length=120)
    example_pinyin: str | None = Field(default=None, max_length=200)
    example_french: str | None = Field(default=None, max_length=200)

    lesson: Lesson = Relationship(back_populates="vocabulaire")


class DialogueLine(SQLModel, table=True):
    __tablename__ = "dialogue_line"

    id: int | None = Field(default=None, primary_key=True)
    lesson_id: int = Field(foreign_key="lesson.id", index=True, ondelete="CASCADE")
    position: int
    speaker: str = Field(max_length=20)  # "A", "B"
    hanzi: str = Field(max_length=200)
    pinyin: str = Field(max_length=300)
    french: str = Field(max_length=300)
    audio_url: str | None = Field(default=None, max_length=300)

    lesson: Lesson = Relationship(back_populates="dialogue")


class QuizQuestion(SQLModel, table=True):
    __tablename__ = "quiz_question"
    __table_args__ = (
        CheckConstraint(
            "type IN (" + ", ".join(f"'{t}'" for t in QUIZ_TYPES) + ")",
            name="ck_quiz_question_type",
        ),
    )

    id: int | None = Field(default=None, primary_key=True)
    lesson_id: int = Field(foreign_key="lesson.id", index=True, ondelete="CASCADE")
    position: int
    type: str = Field(max_length=30)
    hanzi: str = Field(max_length=60)
    pinyin: str = Field(max_length=120)
    french: str = Field(max_length=120)
    options: list[str] = Field(sa_type=JSON)  # 4 choix, dont la bonne réponse
    answer: str = Field(max_length=120)

    lesson: Lesson = Relationship(back_populates="quiz")
