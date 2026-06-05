from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class Split(Base):
    __tablename__ = "splits"

    split_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.user_id"), index=True)
    split_name: Mapped[str] = mapped_column(String(120), index=True)
    is_global: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    created_by_user: Mapped["User | None"] = relationship(back_populates="splits")
    routine_splits: Mapped[list["RoutineSplit"]] = relationship(
        back_populates="split",
        cascade="all, delete-orphan",
    )
    split_exercises: Mapped[list["SplitExercise"]] = relationship(
        back_populates="split",
        cascade="all, delete-orphan",
    )
    workout_sessions: Mapped[list["WorkoutSession"]] = relationship(back_populates="split")


from models.programming.routine_split import RoutineSplit
from models.programming.split_exercise import SplitExercise
from models.users.user import User
from models.workouts.workout_session import WorkoutSession
