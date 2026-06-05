from sqlalchemy import Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class ExerciseSet(Base):
    __tablename__ = "exercise_sets"

    set_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    session_exercise_id: Mapped[int] = mapped_column(
        ForeignKey("session_exercises.session_exercise_id"),
        index=True,
    )
    set_number: Mapped[int] = mapped_column(Integer)
    reps: Mapped[int | None] = mapped_column(Integer)
    weight: Mapped[float | None] = mapped_column(Float)
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    distance: Mapped[float | None] = mapped_column(Float)
    intensity: Mapped[str | None] = mapped_column(String(80))
    notes: Mapped[str | None] = mapped_column(Text)

    session_exercise: Mapped["SessionExercise"] = relationship(back_populates="exercise_sets")
    exercise_records: Mapped[list["UserExerciseRecord"]] = relationship(back_populates="exercise_set")


from models.workouts.session_exercise import SessionExercise
from models.workouts.user_exercise_record import UserExerciseRecord
