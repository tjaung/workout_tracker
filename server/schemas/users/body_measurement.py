from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BodyMeasurementBase(BaseModel):
    measured_at: datetime | None = None
    height_cm: float | None = None
    weight_kg: float | None = None
    body_fat_percentage: float | None = None
    is_current: bool = False
    notes: str | None = Field(default=None, max_length=500)


class BodyMeasurementCreate(BodyMeasurementBase):
    user_id: int


class CurrentBodyMeasurementCreate(BodyMeasurementBase):
    pass


class BodyMeasurementUpdate(BodyMeasurementBase):
    pass


class BodyMeasurement(BodyMeasurementBase):
    model_config = ConfigDict(from_attributes=True)

    measurement_id: int
    user_id: int
    measured_at: datetime
