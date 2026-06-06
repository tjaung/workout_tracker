from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from models.workouts import WorkoutStatus
from models.workouts.session_exercise_status import SessionExerciseStatus


class WorkoutSessionBase(BaseModel):
    user_id: int
    routine_id: int | None = None
    split_id: int | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    status: WorkoutStatus = WorkoutStatus.PLANNED
    notes: str | None = Field(default=None, max_length=500)


class WorkoutSessionCreate(WorkoutSessionBase):
    pass


class WorkoutSessionUpdate(BaseModel):
    routine_id: int | None = None
    split_id: int | None = None
    start_time: datetime | None = None
    end_time: datetime | None = None
    status: WorkoutStatus | None = None
    notes: str | None = Field(default=None, max_length=500)


class WorkoutSession(WorkoutSessionBase):
    model_config = ConfigDict(from_attributes=True)

    workout_session_id: int
    start_time: datetime


class CurrentWorkoutExercise(BaseModel):
    source_split_exercise_id: int | None = None
    exercise_id: int
    name: str
    exercise_type: str | None = None
    equipment: str | None = None
    preparation: str | None = None
    execution: str | None = None
    exercise_order: int
    status: SessionExerciseStatus = SessionExerciseStatus.PARTIAL
    default_sets: int | None = None
    default_reps: int | None = None
    default_weight_value: float | None = None
    default_weight_unit: str | None = None
    default_duration_seconds: int | None = None
    default_distance: float | None = None
    notes: str | None = None


class CurrentWorkout(BaseModel):
    state: str
    routine_id: int | None = None
    routine_name: str | None = None
    split_id: int | None = None
    split_name: str | None = None
    day_of_week: str | None = None
    scheduled_date: date | None = None
    workout_session_id: int | None = None
    status: WorkoutStatus | None = None
    exercises: list[CurrentWorkoutExercise] = []


class StartWorkoutRequest(BaseModel):
    source: Literal["current", "empty"]


class CompleteWorkoutSet(BaseModel):
    set_number: int
    reps: int | None = None
    weight: float | None = None
    duration_seconds: int | None = None
    distance: float | None = None
    intensity: str | None = Field(default=None, max_length=80)
    notes: str | None = Field(default=None, max_length=500)


class CompleteWorkoutExercise(BaseModel):
    exercise_id: int
    source_split_exercise_id: int | None = None
    exercise_order: int
    status: SessionExerciseStatus = SessionExerciseStatus.COMPLETED
    notes: str | None = Field(default=None, max_length=500)
    sets: list[CompleteWorkoutSet] = []


class CompleteWorkoutRequest(BaseModel):
    notes: str | None = Field(default=None, max_length=500)
    exercises: list[CompleteWorkoutExercise]


class WorkoutHistorySet(BaseModel):
    set_id: int
    set_number: int
    reps: int | None = None
    weight: float | None = None
    duration_seconds: int | None = None
    distance: float | None = None
    intensity: str | None = None
    notes: str | None = None


class WorkoutHistoryExercise(BaseModel):
    session_exercise_id: int
    exercise_id: int
    name: str
    exercise_order: int
    status: SessionExerciseStatus
    notes: str | None = None
    sets: list[WorkoutHistorySet] = []


class WorkoutHistoryItem(BaseModel):
    workout_session_id: int
    routine_id: int | None = None
    routine_name: str | None = None
    split_id: int | None = None
    split_name: str | None = None
    start_time: datetime
    end_time: datetime | None = None
    status: WorkoutStatus
    notes: str | None = None
    exercises: list[WorkoutHistoryExercise] = []
