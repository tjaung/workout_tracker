from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.crud.users import (
    get_or_create_user_settings,
    list_user_settings_logs,
    update_user_account,
    update_user_settings,
)
from app.api.v1.endpoints.programming.routine import get_current_user
from core.database import get_db
from schemas.users import User, UserAccountUpdate, UserSettings, UserSettingsLog, UserSettingsUpdate


router = APIRouter(prefix="/users/me", tags=["user-settings"])


@router.get("/settings", response_model=UserSettings)
def get_my_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserSettings:
    settings = get_or_create_user_settings(db, user_id=current_user.user_id)
    db.commit()
    return settings


@router.patch("/settings", response_model=UserSettings)
def update_my_settings(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserSettings:
    settings = update_user_settings(db, payload=payload, user_id=current_user.user_id)
    db.commit()
    return settings


@router.get("/settings/logs", response_model=list[UserSettingsLog])
def get_my_settings_logs(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[UserSettingsLog]:
    return list_user_settings_logs(db, user_id=current_user.user_id, skip=skip, limit=limit)


@router.patch("/account", response_model=User)
def update_my_account(
    payload: UserAccountUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> User:
    user = update_user_account(db, payload=payload, user=current_user)
    db.commit()
    return user
