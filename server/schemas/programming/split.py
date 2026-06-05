from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SplitBase(BaseModel):
    created_by_user_id: int | None = None
    split_name: str = Field(min_length=1, max_length=120)
    is_global: bool = False


class SplitCreate(SplitBase):
    pass


class SplitUpdate(BaseModel):
    created_by_user_id: int | None = None
    split_name: str | None = Field(default=None, min_length=1, max_length=120)
    is_global: bool | None = None


class Split(SplitBase):
    model_config = ConfigDict(from_attributes=True)

    split_id: int
    created_at: datetime
