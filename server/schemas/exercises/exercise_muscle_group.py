from pydantic import BaseModel, ConfigDict


class ExerciseMuscleGroupBase(BaseModel):
    exercise_id: int
    muscle_group_id: int
    is_primary: bool = False


class ExerciseMuscleGroupCreate(ExerciseMuscleGroupBase):
    pass


class ExerciseMuscleGroupUpdate(BaseModel):
    is_primary: bool | None = None


class ExerciseMuscleGroup(ExerciseMuscleGroupBase):
    model_config = ConfigDict(from_attributes=True)
