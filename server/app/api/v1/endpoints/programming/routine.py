from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.crud.auth import get_user_by_id
from app.api.crud.programming import (
    create_full_routine,
    get_active_routine_with_details,
    list_routines_with_details,
    list_user_routines_with_details,
    routine_crud,
)
from app.api.v1.endpoints.base import create_crud_router
from core.auth import decode_session_token
from core.config import Settings, get_settings
from core.database import get_db
from sqlalchemy.exc import IntegrityError
from schemas.programming import Routine, RoutineCreate, RoutineDetail, RoutineFullCreate, RoutineUpdate
from schemas.users import User


router = APIRouter()
routine_detail_router = APIRouter(prefix="/routines", tags=["routines"])


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> User:
    session_token = request.cookies.get(settings.session_cookie_name)
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    try:
        session_data = decode_session_token(session_token)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        ) from exc

    user_id = session_data.get("user_id")
    if not isinstance(user_id, int):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )

    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )
    return user


@routine_detail_router.get("/detailed", response_model=list[RoutineDetail])
def list_detailed_routines(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[RoutineDetail]:
    return list_routines_with_details(
        db,
        user_id=current_user.user_id,
        skip=skip,
        limit=limit,
    )


@routine_detail_router.get("/me", response_model=list[RoutineDetail])
def list_my_routines(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[RoutineDetail]:
    return list_user_routines_with_details(
        db,
        user_id=current_user.user_id,
        skip=skip,
        limit=limit,
    )


@routine_detail_router.get("/active", response_model=RoutineDetail | None)
def active_routine(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoutineDetail | None:
    return get_active_routine_with_details(db, user_id=current_user.user_id)


@routine_detail_router.post("/full", response_model=RoutineDetail, status_code=status.HTTP_201_CREATED)
def create_complete_routine(
    payload: RoutineFullCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoutineDetail:
    try:
        routine = create_full_routine(db, payload=payload, user_id=current_user.user_id)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        raise
    return routine


router.include_router(routine_detail_router)
router.include_router(create_crud_router(
    prefix="/routines",
    tags=["routines"],
    crud=routine_crud,
    read_schema=Routine,
    create_schema=RoutineCreate,
    update_schema=RoutineUpdate,
    pk_params={"routine_id": int},
))
