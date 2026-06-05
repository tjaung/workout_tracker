from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.programming.weight_unit import WeightUnit


class SplitExercise(Base):
    __tablename__ = "split_exercises"

    split_exercise_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    split_id: Mapped[int] = mapped_column(ForeignKey("splits.split_id"), index=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.exercise_id"), index=True)
    exercise_order: Mapped[int] = mapped_column(Integer)
    default_sets: Mapped[int | None] = mapped_column(Integer)
    default_reps: Mapped[int | None] = mapped_column(Integer)
    default_weight_value: Mapped[float | None] = mapped_column(Float)
    default_weight_unit: Mapped[WeightUnit | None] = mapped_column(String(20))
    default_duration_seconds: Mapped[int | None] = mapped_column(Integer)
    default_distance: Mapped[float | None] = mapped_column(Float)
    notes: Mapped[str | None] = mapped_column(Text)

    split: Mapped["Split"] = relationship(back_populates="split_exercises")
    exercise: Mapped["Exercise"] = relationship(back_populates="split_exercises")
    session_exercises: Mapped[list["SessionExercise"]] = relationship(
        back_populates="source_split_exercise",
    )


from models.exercises.exercise import Exercise
from models.programming.split import Split
from models.workouts.session_exercise import SessionExercise
