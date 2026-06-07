from pydantic import BaseModel, ConfigDict, Field

from models.exercises import ExerciseType
from models.workouts import RecordSource


class RecordExerciseOption(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    exercise_id: int
    name: str
    exercise_type: ExerciseType
    equipment: str | None = None


class ExerciseRecordValue(BaseModel):
    key: str
    label: str
    value: float | None = None
    unit: str
    source: RecordSource = RecordSource.ESTIMATED
    display_value: str


class ExerciseRecordSummary(BaseModel):
    exercise: RecordExerciseOption
    records: list[ExerciseRecordValue]


class ManualExerciseRecordInput(BaseModel):
    key: str
    value: float = Field(ge=0)
    notes: str | None = Field(default=None, max_length=500)


class ManualExerciseRecordRequest(BaseModel):
    records: list[ManualExerciseRecordInput]
