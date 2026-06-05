from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class MuscleGroup(Base):
    __tablename__ = "muscle_groups"

    muscle_group_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(80), unique=True, index=True)

    exercises: Mapped[list["ExerciseMuscleGroup"]] = relationship(
        back_populates="muscle_group",
        cascade="all, delete-orphan",
    )


from models.exercises.exercise_muscle_group import ExerciseMuscleGroup
