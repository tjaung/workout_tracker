from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base
from models.workouts.workout_status import WorkoutStatus


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    workout_session_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), index=True)
    routine_id: Mapped[int | None] = mapped_column(ForeignKey("routines.routine_id"), index=True)
    split_id: Mapped[int | None] = mapped_column(ForeignKey("splits.split_id"), index=True)
    start_time: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    end_time: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    status: Mapped[WorkoutStatus] = mapped_column(
        Enum(WorkoutStatus, name="workout_status"),
        default=WorkoutStatus.PLANNED,
        server_default=WorkoutStatus.PLANNED.value,
    )
    notes: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship(back_populates="workout_sessions")
    routine: Mapped["Routine | None"] = relationship(back_populates="workout_sessions")
    split: Mapped["Split | None"] = relationship(back_populates="workout_sessions")
    session_exercises: Mapped[list["SessionExercise"]] = relationship(
        back_populates="workout_session",
        cascade="all, delete-orphan",
    )
    exercise_records: Mapped[list["UserExerciseRecord"]] = relationship(
        back_populates="workout_session",
    )

    def duration_minutes(self) -> int | None:
        if self.end_time is None:
            return None
        return int((self.end_time - self.start_time).total_seconds() // 60)


from models.programming.routine import Routine
from models.programming.split import Split
from models.users.user import User
from models.workouts.session_exercise import SessionExercise
from models.workouts.user_exercise_record import UserExerciseRecord
