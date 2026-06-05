from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.crud.exercises import exercise_crud, list_exercises_with_details
from app.api.v1.endpoints.base import create_crud_router
from core.database import get_db
from schemas.exercises import Exercise, ExerciseCreate, ExerciseDetail, ExerciseUpdate


router = APIRouter()
exercise_detail_router = APIRouter(prefix="/exercises", tags=["exercises"])


@exercise_detail_router.get("/detailed", response_model=list[ExerciseDetail])
def list_detailed_exercises(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[ExerciseDetail]:
    return list_exercises_with_details(db, skip=skip, limit=limit)


router.include_router(exercise_detail_router)
router.include_router(create_crud_router(
    prefix="/exercises",
    tags=["exercises"],
    crud=exercise_crud,
    read_schema=Exercise,
    create_schema=ExerciseCreate,
    update_schema=ExerciseUpdate,
    pk_params={"exercise_id": int},
))
