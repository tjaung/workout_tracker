from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.crud.progress import (
    aggregate_body_measurements,
    aggregate_exercise_performance,
    aggregate_workouts,
    get_progress_summary,
    list_body_measurement_points,
    list_exercise_performance_points,
    list_record_points,
    list_routine_points,
    list_workout_points,
)
from app.api.v1.endpoints.programming.routine import get_current_user
from core.database import get_db
from schemas.progress import (
    AggregationPeriod,
    ProgressAggregatePoint,
    ProgressBodyMeasurementPoint,
    ProgressExercisePoint,
    ProgressRecordPoint,
    ProgressRoutinePoint,
    ProgressSummary,
    ProgressWorkoutPoint,
)
from schemas.users import User


router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/summary", response_model=ProgressSummary)
def progress_summary(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProgressSummary:
    return get_progress_summary(
        db,
        user_id=current_user.user_id,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/body-measurements", response_model=list[ProgressBodyMeasurementPoint])
def progress_body_measurements(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressBodyMeasurementPoint]:
    return list_body_measurement_points(db, user_id=current_user.user_id, start_date=start_date, end_date=end_date)


@router.get("/workouts", response_model=list[ProgressWorkoutPoint])
def progress_workouts(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressWorkoutPoint]:
    return list_workout_points(db, user_id=current_user.user_id, start_date=start_date, end_date=end_date)


@router.get("/routines", response_model=list[ProgressRoutinePoint])
def progress_routines(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressRoutinePoint]:
    return list_routine_points(db, user_id=current_user.user_id, start_date=start_date, end_date=end_date)


@router.get("/exercises", response_model=list[ProgressExercisePoint])
def progress_exercises(
    exercise_id: int | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressExercisePoint]:
    return list_exercise_performance_points(
        db,
        user_id=current_user.user_id,
        exercise_id=exercise_id,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/records", response_model=list[ProgressRecordPoint])
def progress_records(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressRecordPoint]:
    return list_record_points(db, user_id=current_user.user_id, start_date=start_date, end_date=end_date)


@router.get("/body-measurements/aggregate", response_model=list[ProgressAggregatePoint])
def progress_body_measurement_aggregate(
    period: AggregationPeriod = Query(default="month"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressAggregatePoint]:
    return aggregate_body_measurements(
        db,
        user_id=current_user.user_id,
        period=period,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/workouts/aggregate", response_model=list[ProgressAggregatePoint])
def progress_workout_aggregate(
    period: AggregationPeriod = Query(default="month"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressAggregatePoint]:
    return aggregate_workouts(
        db,
        user_id=current_user.user_id,
        period=period,
        start_date=start_date,
        end_date=end_date,
    )


@router.get("/exercises/aggregate", response_model=list[ProgressAggregatePoint])
def progress_exercise_aggregate(
    period: AggregationPeriod = Query(default="month"),
    exercise_id: int | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ProgressAggregatePoint]:
    return aggregate_exercise_performance(
        db,
        user_id=current_user.user_id,
        period=period,
        exercise_id=exercise_id,
        start_date=start_date,
        end_date=end_date,
    )
