"""Format des leçons renvoyé par l'API : identique au type `Lesson` du frontend (types/index.ts)."""

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.models import DialogueLine, Lesson, QuizQuestion, VocabItem


class ApiModel(BaseModel):
    # Python en snake_case (audio_url), JSON en camelCase (audioUrl) comme le frontend
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ExampleOut(ApiModel):
    hanzi: str
    pinyin: str
    french: str


class VocabItemOut(ApiModel):
    id: str
    hanzi: str
    pinyin: str
    french: str
    audio_url: str | None = None
    example: ExampleOut | None = None


class DialogueLineOut(ApiModel):
    id: str
    speaker: str
    hanzi: str
    pinyin: str
    french: str
    audio_url: str | None = None


class QuizQuestionOut(ApiModel):
    id: str
    type: str
    hanzi: str
    pinyin: str
    french: str
    options: list[str]
    answer: str


class LessonOut(ApiModel):
    id: int
    level_id: str
    unit_id: int  # numéro de l'unité dans le niveau, comme dans le frontend
    unit_title: str
    chinese: str
    pinyin: str
    title: str
    description: str
    language: str
    modules: list[str]
    color: str | None = None
    vocabulaire: list[VocabItemOut]
    dialogue: list[DialogueLineOut]
    quiz: list[QuizQuestionOut]


def _vocab_out(v: VocabItem) -> VocabItemOut:
    example = None
    if v.example_hanzi:
        example = ExampleOut(hanzi=v.example_hanzi, pinyin=v.example_pinyin or "", french=v.example_french or "")
    return VocabItemOut(id=str(v.id), hanzi=v.hanzi, pinyin=v.pinyin, french=v.french,
                        audio_url=v.audio_url, example=example)


def _dialogue_out(d: DialogueLine) -> DialogueLineOut:
    return DialogueLineOut(id=str(d.id), speaker=d.speaker, hanzi=d.hanzi, pinyin=d.pinyin,
                           french=d.french, audio_url=d.audio_url)


def _quiz_out(q: QuizQuestion) -> QuizQuestionOut:
    return QuizQuestionOut(id=str(q.id), type=q.type, hanzi=q.hanzi, pinyin=q.pinyin,
                           french=q.french, options=q.options, answer=q.answer)


def lesson_out(lesson: Lesson) -> LessonOut:
    """Transforme les tables (leçon + unité + contenu) en une leçon au format du frontend."""
    return LessonOut(
        id=lesson.id,
        level_id=lesson.unit.level_code,
        unit_id=lesson.unit.number,
        unit_title=lesson.unit.title,
        chinese=lesson.chinese,
        pinyin=lesson.pinyin,
        title=lesson.title,
        description=lesson.description,
        language=lesson.language,
        modules=lesson.modules,
        color=lesson.color,
        vocabulaire=[_vocab_out(v) for v in lesson.vocabulaire],
        dialogue=[_dialogue_out(d) for d in lesson.dialogue],
        quiz=[_quiz_out(q) for q in lesson.quiz],
    )
