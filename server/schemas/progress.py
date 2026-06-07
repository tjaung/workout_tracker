from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel

AggregationPeriod = Literal["day", "week", "month", "year"]


class ProgressBodyMeasurementPoint(BaseModel):
    body_fat_percentage: float | None = None
    height_cm: float | None = None
    measured_at: datetime
    measurement_id: int
    weight_kg: float | None = None


class ProgressWorkoutPoint(BaseModel):
    duration_minutes: int | None = None
    end_time: datetime | None = None
    exercise_count: int
    routine_id: int | None = None
    routine_name: str | None = None
    set_count: int
    split_id: int | None = None
    split_name: str | None = None
    start_time: datetime
    status: str
    workout_session_id: int


class ProgressRoutinePoint(BaseModel):
    end_date: date | None = None
    is_active: bool
    routine_id: int
    routine_name: str
    routine_type: str | None = None
    start_date: date | None = None


class ProgressExercisePoint(BaseModel):
    average_weight: float | None = None
    exercise_id: int
    exercise_name: str
    exercise_type: str
    max_duration_seconds: int | None = None
    max_weight: float | None = None
    performed_at: datetime
    rep_count: int
    routine_id: int | None = None
    routine_name: str | None = None
    session_exercise_id: int
    set_count: int
    split_id: int | None = None
    split_name: str | None = None
    total_distance: float | None = None
    total_duration_seconds: int
    workout_session_id: int


class ProgressRecordPoint(BaseModel):
    achieved_at: datetime
    exercise_id: int
    exercise_name: str
    is_current: bool
    record_id: int
    record_type_id: int
    record_type_name: str
    value: float


class ProgressSummary(BaseModel):
    active_days: int
    average_workout_duration_minutes: float | None = None
    cumulative_workouts: int
    record_changes: int
    routines_ended: int
    routines_started: int
    weight_change_kg: float | None = None


class ProgressAggregatePoint(BaseModel):
    period_start: date
    values: dict[str, float | int | None]
