from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from models.workouts import WorkoutStatus


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
