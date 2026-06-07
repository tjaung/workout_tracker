from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


ThemeMode = Literal["system", "light", "dark"]
UnitSystem = Literal["imperial", "metric"]


class UserSettingsBase(BaseModel):
    left_handed_mode: bool = False
    theme_mode: ThemeMode = "dark"
    unit_system: UnitSystem = "imperial"
    workout_rest_timer_seconds: int = Field(default=90, ge=5, le=600)


class UserSettingsCreate(UserSettingsBase):
    user_id: int


class UserSettingsUpdate(BaseModel):
    left_handed_mode: bool | None = None
    theme_mode: ThemeMode | None = None
    unit_system: UnitSystem | None = None
    workout_rest_timer_seconds: int | None = Field(default=None, ge=5, le=600)


class UserSettings(UserSettingsBase):
    model_config = ConfigDict(from_attributes=True)

    user_settings_id: int
    user_id: int
    created_at: datetime
    updated_at: datetime


class UserSettingsLog(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_settings_log_id: int
    user_id: int
    setting_key: str
    old_value: object | None = None
    new_value: object | None = None
    changed_at: datetime
