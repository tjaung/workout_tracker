from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from models.exercises import ExerciseType
from schemas.exercises.muscle_group import MuscleGroup


class ExerciseBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    exercise_type: ExerciseType
    equipment: str | None = Field(default=None, max_length=120)
    preparation: str | None = None
    execution: str | None = None
    created_by_user_id: int | None = None
    is_global: bool = False


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    exercise_type: ExerciseType | None = None
    equipment: str | None = Field(default=None, max_length=120)
    preparation: str | None = None
    execution: str | None = None
    created_by_user_id: int | None = None
    is_global: bool | None = None


class Exercise(ExerciseBase):
    model_config = ConfigDict(from_attributes=True)

    exercise_id: int
    created_at: datetime


class ExerciseMuscleGroupDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    exercise_id: int
    muscle_group_id: int
    is_primary: bool
    muscle_group: MuscleGroup


class ExerciseDetail(Exercise):
    muscle_groups: list[ExerciseMuscleGroupDetail] = []
