from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class BodyMeasurement(Base):
    __tablename__ = "body_measurements"

    measurement_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), index=True)
    measured_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    height_cm: Mapped[float | None] = mapped_column(Float)
    weight_kg: Mapped[float | None] = mapped_column(Float)
    body_fat_percentage: Mapped[float | None] = mapped_column(Float)
    is_current: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    notes: Mapped[str | None] = mapped_column(Text)

    user: Mapped["User"] = relationship(back_populates="body_measurements")


from models.users.user import User
