from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.crud.records import (
    get_exercise_record_summary,
    list_record_exercises,
    upsert_manual_exercise_records,
)
from app.api.v1.endpoints.programming.routine import get_current_user
from core.database import get_db
from schemas.records import (
    ExerciseRecordSummary,
    ManualExerciseRecordRequest,
    RecordExerciseOption,
)
from schemas.users import User


router = APIRouter(prefix="/records", tags=["records"])


@router.get("/exercises", response_model=list[RecordExerciseOption])
def records_exercises(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[RecordExerciseOption]:
    return list_record_exercises(db, user_id=current_user.user_id)


@router.get("/exercises/{exercise_id}/summary", response_model=ExerciseRecordSummary)
def records_exercise_summary(
    exercise_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExerciseRecordSummary:
    return get_exercise_record_summary(db, user_id=current_user.user_id, exercise_id=exercise_id)


@router.post("/exercises/{exercise_id}/manual", response_model=ExerciseRecordSummary)
def records_manual_update(
    exercise_id: int,
    payload: ManualExerciseRecordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ExerciseRecordSummary:
    summary = upsert_manual_exercise_records(
        db,
        user_id=current_user.user_id,
        exercise_id=exercise_id,
        payload=payload,
    )
    db.commit()
    return summary
