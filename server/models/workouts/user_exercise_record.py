from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.workouts.record_source import RecordSource


class UserExerciseRecord(Base):
    __tablename__ = "user_exercise_records"

    record_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), index=True)
    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.exercise_id"), index=True)
    record_type_id: Mapped[int] = mapped_column(ForeignKey("record_types.record_type_id"), index=True)
    workout_session_id: Mapped[int | None] = mapped_column(
        ForeignKey("workout_sessions.workout_session_id"),
        index=True,
    )
    session_exercise_id: Mapped[int | None] = mapped_column(
        ForeignKey("session_exercises.session_exercise_id"),
        index=True,
    )
    set_id: Mapped[int | None] = mapped_column(ForeignKey("exercise_sets.set_id"), index=True)
    value: Mapped[float] = mapped_column(Float)
    source: Mapped[RecordSource] = mapped_column(
        Enum(RecordSource, name="record_source"),
        default=RecordSource.MANUAL,
        server_default=RecordSource.MANUAL.value,
    )
    is_current: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    achieved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    notes: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship(back_populates="exercise_records")
    exercise: Mapped["Exercise"] = relationship(back_populates="exercise_records")
    record_type: Mapped["RecordType"] = relationship(back_populates="exercise_records")
    workout_session: Mapped["WorkoutSession | None"] = relationship(
        back_populates="exercise_records",
    )
    session_exercise: Mapped["SessionExercise | None"] = relationship(
        back_populates="exercise_records",
    )
    exercise_set: Mapped["ExerciseSet | None"] = relationship(back_populates="exercise_records")


from models.exercises.exercise import Exercise
from models.exercises.record_type import RecordType
from models.users.user import User
from models.workouts.exercise_set import ExerciseSet
from models.workouts.session_exercise import SessionExercise
from models.workouts.workout_session import WorkoutSession
