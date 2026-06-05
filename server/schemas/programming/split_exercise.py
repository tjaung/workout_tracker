from pydantic import BaseModel, ConfigDict, Field

from models.programming.weight_unit import WeightUnit


class SplitExerciseBase(BaseModel):
    split_id: int
    exercise_id: int
    exercise_order: int
    default_sets: int | None = None
    default_reps: int | None = None
    default_weight_value: float | None = None
    default_weight_unit: WeightUnit | None = None
    default_duration_seconds: int | None = None
    default_distance: float | None = None
    notes: str | None = Field(default=None, max_length=500)


class SplitExerciseCreate(SplitExerciseBase):
    pass


class SplitExerciseUpdate(BaseModel):
    exercise_order: int | None = None
    default_sets: int | None = None
    default_reps: int | None = None
    default_weight_value: float | None = None
    default_weight_unit: WeightUnit | None = None
    default_duration_seconds: int | None = None
    default_distance: float | None = None
    notes: str | None = Field(default=None, max_length=500)


class SplitExercise(SplitExerciseBase):
    model_config = ConfigDict(from_attributes=True)

    split_exercise_id: int
