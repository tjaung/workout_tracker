from pydantic import BaseModel, ConfigDict


class RoutineSplitBase(BaseModel):
    routine_id: int
    split_id: int
    split_order: int
    day_of_week: str | None = None


class RoutineSplitCreate(RoutineSplitBase):
    pass


class RoutineSplitUpdate(BaseModel):
    split_order: int | None = None
    day_of_week: str | None = None


class RoutineSplit(RoutineSplitBase):
    model_config = ConfigDict(from_attributes=True)
