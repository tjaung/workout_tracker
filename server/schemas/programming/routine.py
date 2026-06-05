from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from models.programming.routine_goal import RoutineGoal
from models.programming.routine_intensity import RoutineIntensity
from models.programming.routine_type import RoutineType
from models.programming.weight_unit import WeightUnit


class RoutineBase(BaseModel):
    created_by_user_id: int | None = None
    routine_name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    routine_type: RoutineType | None = None
    goal: RoutineGoal | None = None
    intensity: RoutineIntensity | None = None
    is_global: bool = False
    is_active: bool = False
    start_date: date | None = None
    end_date: date | None = None


class RoutineCreate(RoutineBase):
    pass


class RoutineUpdate(BaseModel):
    created_by_user_id: int | None = None
    routine_name: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = None
    routine_type: RoutineType | None = None
    goal: RoutineGoal | None = None
    intensity: RoutineIntensity | None = None
    is_global: bool | None = None
    is_active: bool | None = None
    start_date: date | None = None
    end_date: date | None = None


class RoutineFullSplitExerciseCreate(BaseModel):
    exercise_id: int
    exercise_order: int
    default_sets: int | None = None
    default_reps: int | None = None
    default_weight_value: float | None = None
    default_weight_unit: WeightUnit | None = None
    default_duration_seconds: int | None = None
    default_distance: float | None = None
    notes: str | None = Field(default=None, max_length=500)


class RoutineFullSplitCreate(BaseModel):
    split_name: str = Field(min_length=1, max_length=120)
    split_order: int
    day_of_week: str | None = None
    exercises: list[RoutineFullSplitExerciseCreate] = []


class RoutineFullCreate(BaseModel):
    routine_name: str = Field(min_length=1, max_length=120)
    description: str | None = None
    routine_type: RoutineType | None = None
    goal: RoutineGoal | None = None
    intensity: RoutineIntensity | None = None
    is_global: bool = False
    start_now: bool = False
    splits: list[RoutineFullSplitCreate] = Field(min_length=1)


class Routine(RoutineBase):
    model_config = ConfigDict(from_attributes=True)

    routine_id: int
    created_at: datetime


class RoutineExerciseSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    exercise_id: int
    name: str
    exercise_type: str


class RoutineSplitExerciseDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    split_exercise_id: int
    split_id: int
    exercise_id: int
    exercise_order: int
    default_sets: int | None = None
    default_reps: int | None = None
    default_weight_value: float | None = None
    default_weight_unit: WeightUnit | None = None
    default_duration_seconds: int | None = None
    default_distance: float | None = None
    notes: str | None = None
    exercise: RoutineExerciseSummary


class RoutineSplitSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    split_id: int
    created_by_user_id: int | None = None
    split_name: str
    is_global: bool
    created_at: datetime
    split_exercises: list[RoutineSplitExerciseDetail] = []


class RoutineSplitDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    routine_id: int
    split_id: int
    split_order: int
    day_of_week: str | None = None
    split: RoutineSplitSummary


class RoutineDetail(Routine):
    routine_splits: list[RoutineSplitDetail] = []
