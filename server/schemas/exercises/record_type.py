from pydantic import BaseModel, ConfigDict, Field

from models.exercises import ComparisonType, RecordCategory


class RecordTypeBase(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    record_category: RecordCategory
    comparison_type: ComparisonType
    default_unit: str = Field(min_length=1, max_length=40)


class RecordTypeCreate(RecordTypeBase):
    pass


class RecordTypeUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    record_category: RecordCategory | None = None
    comparison_type: ComparisonType | None = None
    default_unit: str | None = Field(default=None, min_length=1, max_length=40)


class RecordType(RecordTypeBase):
    model_config = ConfigDict(from_attributes=True)

    record_type_id: int
