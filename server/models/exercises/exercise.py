from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.exercises.exercise_type import ExerciseType


class Exercise(Base):
    __tablename__ = "exercises"

    exercise_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    exercise_type: Mapped[ExerciseType] = mapped_column(Enum(ExerciseType, name="exercise_type"))
    equipment: Mapped[str | None] = mapped_column(String(120))
    preparation: Mapped[str | None] = mapped_column(Text)
    execution: Mapped[str | None] = mapped_column(Text)
    created_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.user_id"), index=True)
    is_global: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    created_by_user: Mapped["User | None"] = relationship(back_populates="exercises")
    muscle_groups: Mapped[list["ExerciseMuscleGroup"]] = relationship(
        back_populates="exercise",
        cascade="all, delete-orphan",
    )
    split_exercises: Mapped[list["SplitExercise"]] = relationship(back_populates="exercise")
    session_exercises: Mapped[list["SessionExercise"]] = relationship(back_populates="exercise")
    exercise_records: Mapped[list["UserExerciseRecord"]] = relationship(back_populates="exercise")


from models.exercises.exercise_muscle_group import ExerciseMuscleGroup
from models.programming.split_exercise import SplitExercise
from models.users.user import User
from models.workouts.session_exercise import SessionExercise
from models.workouts.user_exercise_record import UserExerciseRecord
