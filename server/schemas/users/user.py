from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    email: str = Field(min_length=1, max_length=255)
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    sex: Literal["female", "male"]
    date_of_birth: date


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=255)


class UserUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=1, max_length=50)
    email: str | None = Field(default=None, min_length=1, max_length=255)
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    sex: Literal["female", "male"] | None = None
    date_of_birth: date | None = None
    password: str | None = Field(default=None, min_length=8, max_length=255)


class UserAccountUpdate(BaseModel):
    username: str | None = Field(default=None, min_length=1, max_length=50)
    email: str | None = Field(default=None, min_length=1, max_length=255)
    first_name: str | None = Field(default=None, min_length=1, max_length=100)
    last_name: str | None = Field(default=None, min_length=1, max_length=100)
    sex: Literal["female", "male"] | None = None
    date_of_birth: date | None = None
    password: str | None = Field(default=None, min_length=8, max_length=255)


class User(UserBase):
    model_config = ConfigDict(from_attributes=True)

    user_id: int
    created_at: datetime
    last_login: datetime | None = None
