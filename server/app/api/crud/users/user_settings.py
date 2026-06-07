from typing import Any

from sqlalchemy.orm import Session

from app.api.crud.base import CRUDBase
from models.users import User, UserSettings, UserSettingsLog
from schemas.users import UserAccountUpdate, UserSettingsCreate, UserSettingsUpdate, UserUpdate


user_settings_crud = CRUDBase[UserSettings, UserSettingsCreate, UserSettingsUpdate](
    UserSettings,
    "User settings",
)


def get_or_create_user_settings(db: Session, *, user_id: int) -> UserSettings:
    settings = db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
    if settings is not None:
        return settings

    settings = UserSettings(user_id=user_id)
    db.add(settings)
    db.flush()
    db.refresh(settings)
    return settings


def update_user_settings(
    db: Session,
    *,
    payload: UserSettingsUpdate,
    user_id: int,
) -> UserSettings:
    settings = get_or_create_user_settings(db, user_id=user_id)
    data = payload.model_dump(exclude_unset=True)
    for field_name, new_value in data.items():
        old_value = getattr(settings, field_name)
        if old_value == new_value:
            continue
        setattr(settings, field_name, new_value)
        _add_settings_log(
            db,
            user_id=user_id,
            setting_key=field_name,
            old_value=old_value,
            new_value=new_value,
        )

    db.add(settings)
    db.flush()
    db.refresh(settings)
    return settings


def list_user_settings_logs(
    db: Session,
    *,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
) -> list[UserSettingsLog]:
    return (
        db.query(UserSettingsLog)
        .filter(UserSettingsLog.user_id == user_id)
        .order_by(UserSettingsLog.changed_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def update_user_account(
    db: Session,
    *,
    payload: UserAccountUpdate,
    user: User,
) -> User:
    data = payload.model_dump(exclude_unset=True)
    update_payload = UserUpdate(**data)

    for field_name, new_value in data.items():
        old_value = "***" if field_name == "password" else getattr(user, field_name)
        logged_new_value = "***" if field_name == "password" else new_value
        if old_value == logged_new_value:
            continue
        _add_settings_log(
            db,
            user_id=user.user_id,
            setting_key=f"account.{field_name}",
            old_value=old_value,
            new_value=logged_new_value,
        )

    from app.api.crud.users.user import user_crud

    return user_crud.update(db, user, update_payload)


def _add_settings_log(
    db: Session,
    *,
    user_id: int,
    setting_key: str,
    old_value: Any,
    new_value: Any,
) -> None:
    db.add(
        UserSettingsLog(
            user_id=user_id,
            setting_key=setting_key,
            old_value=old_value,
            new_value=new_value,
        )
    )
