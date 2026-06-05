from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from models.workouts import RecordSource


class UserExerciseRecordBase(BaseModel):
    user_id: int
    exercise_id: int
    record_type_id: int
    workout_session_id: int | None = None
    session_exercise_id: int | None = None
    set_id: int | None = None
    value: float
    source: RecordSource = RecordSource.MANUAL
    is_current: bool = True
    achieved_at: datetime | None = None
    notes: str | None = Field(default=None, max_length=500)


class UserExerciseRecordCreate(UserExerciseRecordBase):
    pass


class UserExerciseRecordUpdate(BaseModel):
    workout_session_id: int | None = None
    session_exercise_id: int | None = None
    set_id: int | None = None
    value: float | None = None
    source: RecordSource | None = None
    is_current: bool | None = None
    achieved_at: datetime | None = None
    notes: str | None = Field(default=None, max_length=500)


class UserExerciseRecord(UserExerciseRecordBase):
    model_config = ConfigDict(from_attributes=True)

    record_id: int
    achieved_at: datetime
