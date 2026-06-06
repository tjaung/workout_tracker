from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.crud.workouts import (
    complete_workout,
    get_current_workout,
    list_completed_workouts_with_details,
    start_workout,
    workout_session_crud,
)
from app.api.v1.endpoints.base import create_crud_router
from app.api.v1.endpoints.programming.routine import get_current_user
from core.database import get_db
from schemas.users import User
from schemas.workouts import (
    CompleteWorkoutRequest,
    CurrentWorkout,
    StartWorkoutRequest,
    WorkoutHistoryItem,
    WorkoutSession,
    WorkoutSessionCreate,
    WorkoutSessionUpdate,
)


router = APIRouter()
workout_detail_router = APIRouter(prefix="/workouts", tags=["workouts"])


@workout_detail_router.get("/current", response_model=CurrentWorkout)
def current_workout(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CurrentWorkout:
    return get_current_workout(db, user_id=current_user.user_id)


@workout_detail_router.get("/history", response_model=list[WorkoutHistoryItem])
def workout_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[WorkoutHistoryItem]:
    return list_completed_workouts_with_details(db, user_id=current_user.user_id, limit=500)


@workout_detail_router.post("/start", response_model=CurrentWorkout)
def start_current_workout(
    payload: StartWorkoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CurrentWorkout:
    workout = start_workout(db, user_id=current_user.user_id, source=payload.source)
    db.commit()
    return workout


@workout_detail_router.post("/{workout_session_id}/complete", response_model=CurrentWorkout)
def complete_current_workout(
    workout_session_id: int,
    payload: CompleteWorkoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CurrentWorkout:
    workout = complete_workout(
        db,
        workout_session_id=workout_session_id,
        user_id=current_user.user_id,
        payload=payload,
    )
    db.commit()
    return workout


router.include_router(workout_detail_router)
router.include_router(create_crud_router(
    prefix="/workout-sessions",
    tags=["workout-sessions"],
    crud=workout_session_crud,
    read_schema=WorkoutSession,
    create_schema=WorkoutSessionCreate,
    update_schema=WorkoutSessionUpdate,
    pk_params={"workout_session_id": int},
))
