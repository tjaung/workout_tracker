from sqlalchemy import ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class SessionExercise(Base):
    __tablename__ = "session_exercises"

    session_exercise_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    workout_session_id: Mapped[int] = mapped_column(
        ForeignKey("workout_sessions.workout_session_id"),
        index=True,
    )
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.exercise_id"), index=True)
    source_split_exercise_id: Mapped[int | None] = mapped_column(
        ForeignKey("split_exercises.split_exercise_id"),
        index=True,
    )
    exercise_order: Mapped[int] = mapped_column(Integer)
    notes: Mapped[str | None] = mapped_column(Text)

    workout_session: Mapped["WorkoutSession"] = relationship(back_populates="session_exercises")
    exercise: Mapped["Exercise"] = relationship(back_populates="session_exercises")
    source_split_exercise: Mapped["SplitExercise | None"] = relationship(
        back_populates="session_exercises",
    )
    exercise_sets: Mapped[list["ExerciseSet"]] = relationship(
        back_populates="session_exercise",
        cascade="all, delete-orphan",
    )
    exercise_records: Mapped[list["UserExerciseRecord"]] = relationship(
        back_populates="session_exercise",
    )


from models.exercises.exercise import Exercise
from models.programming.split_exercise import SplitExercise
from models.workouts.exercise_set import ExerciseSet
from models.workouts.user_exercise_record import UserExerciseRecord
from models.workouts.workout_session import WorkoutSession
