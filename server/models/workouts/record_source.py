from enum import StrEnum


class RecordSource(StrEnum):
    MANUAL = "MANUAL"
    WORKOUT_DERIVED = "WORKOUT_DERIVED"
    ESTIMATED = "ESTIMATED"
