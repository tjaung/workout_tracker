from pydantic import BaseModel, ConfigDict, Field


class MuscleGroupBase(BaseModel):
    name: str = Field(min_length=1, max_length=80)


class MuscleGroupCreate(MuscleGroupBase):
    pass


class MuscleGroupUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=80)


class MuscleGroup(MuscleGroupBase):
    model_config = ConfigDict(from_attributes=True)

    muscle_group_id: int
