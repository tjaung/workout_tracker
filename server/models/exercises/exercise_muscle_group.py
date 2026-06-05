from sqlalchemy import Boolean, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class ExerciseMuscleGroup(Base):
    __tablename__ = "exercise_muscle_groups"
    __table_args__ = (PrimaryKeyConstraint("exercise_id", "muscle_group_id"),)

    exercise_id: Mapped[int] = mapped_column(ForeignKey("exercises.exercise_id"))
    muscle_group_id: Mapped[int] = mapped_column(ForeignKey("muscle_groups.muscle_group_id"))
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")

    exercise: Mapped["Exercise"] = relationship(back_populates="muscle_groups")
    muscle_group: Mapped["MuscleGroup"] = relationship(back_populates="exercises")


from models.exercises.exercise import Exercise
from models.exercises.muscle_group import MuscleGroup
