from datetime import datetime

from sqlalchemy import DateTime, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    body_measurements: Mapped[list["BodyMeasurement"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
    exercises: Mapped[list["Exercise"]] = relationship(back_populates="created_by_user")
    routines: Mapped[list["Routine"]] = relationship(back_populates="created_by_user")
    splits: Mapped[list["Split"]] = relationship(back_populates="created_by_user")
    workout_sessions: Mapped[list["WorkoutSession"]] = relationship(back_populates="user")
    exercise_records: Mapped[list["UserExerciseRecord"]] = relationship(back_populates="user")


from models.exercises.exercise import Exercise
from models.programming.routine import Routine
from models.programming.split import Split
from models.users.body_measurement import BodyMeasurement
from models.workouts.user_exercise_record import UserExerciseRecord
from models.workouts.workout_session import WorkoutSession
