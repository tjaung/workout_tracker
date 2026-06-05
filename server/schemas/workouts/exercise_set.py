from pydantic import BaseModel, ConfigDict, Field


class ExerciseSetBase(BaseModel):
    session_exercise_id: int
    set_number: int
    reps: int | None = None
    weight: float | None = None
    duration_seconds: int | None = None
    distance: float | None = None
    intensity: str | None = Field(default=None, max_length=80)
    notes: str | None = Field(default=None, max_length=500)


class ExerciseSetCreate(ExerciseSetBase):
    pass


class ExerciseSetUpdate(BaseModel):
    set_number: int | None = None
    reps: int | None = None
    weight: float | None = None
    duration_seconds: int | None = None
    distance: float | None = None
    intensity: str | None = Field(default=None, max_length=80)
    notes: str | None = Field(default=None, max_length=500)


class ExerciseSet(ExerciseSetBase):
    model_config = ConfigDict(from_attributes=True)

    set_id: int
