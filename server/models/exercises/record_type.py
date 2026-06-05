from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.exercises.comparison_type import ComparisonType
from models.exercises.record_category import RecordCategory


class RecordType(Base):
    __tablename__ = "record_types"

    record_type_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    record_category: Mapped[RecordCategory] = mapped_column(
        Enum(RecordCategory, name="record_category"),
    )
    comparison_type: Mapped[ComparisonType] = mapped_column(
        Enum(ComparisonType, name="comparison_type"),
    )
    default_unit: Mapped[str] = mapped_column(String(40))

    exercise_records: Mapped[list["UserExerciseRecord"]] = relationship(back_populates="record_type")


from models.workouts.user_exercise_record import UserExerciseRecord
