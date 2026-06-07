from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from core.database import Base


class UserSettings(Base):
    __tablename__ = "user_settings"

    user_settings_id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), unique=True, index=True)
    left_handed_mode: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    theme_mode: Mapped[str] = mapped_column(String(20), default="dark", server_default="dark")
    unit_system: Mapped[str] = mapped_column(String(20), default="imperial", server_default="imperial")
    workout_rest_timer_seconds: Mapped[int] = mapped_column(Integer, default=90, server_default="90")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )

    user: Mapped["User"] = relationship(back_populates="settings")


from models.users.user import User
