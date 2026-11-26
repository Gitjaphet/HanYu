"""Données échangées par les routes /auth."""

from datetime import datetime

from pydantic import EmailStr, Field, field_validator

from app.models import User
from app.schemas.lesson import ApiModel


class RegisterIn(ApiModel):
    email: EmailStr
    pseudo: str = Field(min_length=3, max_length=30, pattern=r"^[\w.\- ]+$")
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("pseudo")
    @classmethod
    def strip_pseudo(cls, v: str) -> str:
        return v.strip()


class LoginIn(ApiModel):
    email: EmailStr
    password: str = Field(max_length=128)

    @field_validator("email")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.strip().lower()


class ForgotPasswordIn(ApiModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def lower_email(cls, v: str) -> str:
        return v.strip().lower()


class ResetPasswordIn(ApiModel):
    token: str = Field(min_length=20, max_length=200)
    password: str = Field(min_length=8, max_length=128)


class MessageOut(ApiModel):
    detail: str


class UserOut(ApiModel):
    id: int
    email: str
    pseudo: str
    is_superadmin: bool
    created_at: datetime


def user_out(user: User) -> UserOut:
    return UserOut(id=user.id, email=user.email, pseudo=user.pseudo,
                   is_superadmin=user.is_superadmin, created_at=user.created_at)
