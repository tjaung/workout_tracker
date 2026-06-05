from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.programming.routine_goal import RoutineGoal
from models.programming.routine_intensity import RoutineIntensity
from models.programming.routine_type import RoutineType


class Routine(Base):
    __tablename__ = "routines"

    routine_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    created_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.user_id"), index=True)
    routine_name: Mapped[str] = mapped_column(String(120), index=True)
    description: Mapped[str | None] = mapped_column(Text)
    routine_type: Mapped[RoutineType | None] = mapped_column(String(50))
    goal: Mapped[RoutineGoal | None] = mapped_column(String(50))
    intensity: Mapped[RoutineIntensity | None] = mapped_column(String(50))
    is_global: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    start_date: Mapped[date | None] = mapped_column(Date)
    end_date: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    created_by_user: Mapped["User | None"] = relationship(back_populates="routines")
    routine_splits: Mapped[list["RoutineSplit"]] = relationship(
        back_populates="routine",
        cascade="all, delete-orphan",
    )
    workout_sessions: Mapped[list["WorkoutSession"]] = relationship(back_populates="routine")

    def duration_days(self) -> int | None:
        if self.start_date is None or self.end_date is None:
            return None
        return (self.end_date - self.start_date).days


from models.programming.routine_split import RoutineSplit
from models.users.user import User
from models.workouts.workout_session import WorkoutSession
