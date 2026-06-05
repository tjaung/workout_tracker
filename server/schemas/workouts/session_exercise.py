from pydantic import BaseModel, ConfigDict, Field


class SessionExerciseBase(BaseModel):
    workout_session_id: int
    exercise_id: int
    source_split_exercise_id: int | None = None
    exercise_order: int
    notes: str | None = Field(default=None, max_length=500)


class SessionExerciseCreate(SessionExerciseBase):
    pass


class SessionExerciseUpdate(BaseModel):
    source_split_exercise_id: int | None = None
    exercise_order: int | None = None
    notes: str | None = Field(default=None, max_length=500)


class SessionExercise(SessionExerciseBase):
    model_config = ConfigDict(from_attributes=True)

    session_exercise_id: int
