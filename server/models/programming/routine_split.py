from sqlalchemy import ForeignKey, Integer, PrimaryKeyConstraint, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class RoutineSplit(Base):
    __tablename__ = "routine_splits"
    __table_args__ = (PrimaryKeyConstraint("routine_id", "split_id"),)

    routine_id: Mapped[int] = mapped_column(ForeignKey("routines.routine_id"))
    split_id: Mapped[int] = mapped_column(ForeignKey("splits.split_id"))
    split_order: Mapped[int] = mapped_column(Integer)
    day_of_week: Mapped[str | None] = mapped_column(String(20))

    routine: Mapped["Routine"] = relationship(back_populates="routine_splits")
    split: Mapped["Split"] = relationship(back_populates="routine_splits")


from models.programming.routine import Routine
from models.programming.split import Split
