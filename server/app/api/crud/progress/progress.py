from datetime import date, datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.exercises import Exercise, RecordType
from models.programming import Routine, Split
from models.users import BodyMeasurement
from models.workouts import ExerciseSet, SessionExercise, UserExerciseRecord, WorkoutSession, WorkoutStatus
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
from services.progress import aggregate_time_series


def list_body_measurement_points(
    db: Session,
    *,
    user_id: int,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[ProgressBodyMeasurementPoint]:
    query = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == user_id)
    query = _filter_datetime_range(query, BodyMeasurement.measured_at, start_date, end_date)
    measurements = query.order_by(BodyMeasurement.measured_at.asc()).all()
    return [
        ProgressBodyMeasurementPoint(
            body_fat_percentage=measurement.body_fat_percentage,
            height_cm=measurement.height_cm,
            measured_at=measurement.measured_at,
            measurement_id=measurement.measurement_id,
            weight_kg=measurement.weight_kg,
        )
        for measurement in measurements
    ]


def list_workout_points(
    db: Session,
    *,
    user_id: int,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[ProgressWorkoutPoint]:
    query = (
        db.query(
            WorkoutSession,
            Routine.routine_name.label("routine_name"),
            Split.split_name.label("split_name"),
            func.count(func.distinct(SessionExercise.session_exercise_id)).label("exercise_count"),
            func.count(ExerciseSet.set_id).label("set_count"),
        )
        .outerjoin(Routine, WorkoutSession.routine_id == Routine.routine_id)
        .outerjoin(Split, WorkoutSession.split_id == Split.split_id)
        .outerjoin(SessionExercise, WorkoutSession.workout_session_id == SessionExercise.workout_session_id)
        .outerjoin(ExerciseSet, SessionExercise.session_exercise_id == ExerciseSet.session_exercise_id)
        .filter(WorkoutSession.user_id == user_id)
        .filter(WorkoutSession.status == WorkoutStatus.COMPLETED)
        .group_by(WorkoutSession.workout_session_id, Routine.routine_name, Split.split_name)
    )
    query = _filter_datetime_range(query, WorkoutSession.start_time, start_date, end_date)

    return [
        ProgressWorkoutPoint(
            duration_minutes=session.duration_minutes(),
            end_time=session.end_time,
            exercise_count=exercise_count or 0,
            routine_id=session.routine_id,
            routine_name=routine_name,
            set_count=set_count or 0,
            split_id=session.split_id,
            split_name=split_name,
            start_time=session.start_time,
            status=session.status.value,
            workout_session_id=session.workout_session_id,
        )
        for session, routine_name, split_name, exercise_count, set_count in query.order_by(WorkoutSession.start_time.asc()).all()
    ]


def list_routine_points(
    db: Session,
    *,
    user_id: int,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[ProgressRoutinePoint]:
    query = db.query(Routine).filter(Routine.created_by_user_id == user_id)
    if start_date is not None:
        query = query.filter((Routine.end_date.is_(None)) | (Routine.end_date >= start_date))
    if end_date is not None:
        query = query.filter((Routine.start_date.is_(None)) | (Routine.start_date <= end_date))

    routines = query.order_by(Routine.start_date.asc().nullslast(), Routine.created_at.asc()).all()
    return [
        ProgressRoutinePoint(
            end_date=routine.end_date,
            is_active=routine.is_active,
            routine_id=routine.routine_id,
            routine_name=routine.routine_name,
            routine_type=routine.routine_type,
            start_date=routine.start_date,
        )
        for routine in routines
    ]


def list_exercise_performance_points(
    db: Session,
    *,
    user_id: int,
    exercise_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[ProgressExercisePoint]:
    query = (
        db.query(
            SessionExercise.session_exercise_id,
            SessionExercise.exercise_id,
            Exercise.name.label("exercise_name"),
            Exercise.exercise_type.label("exercise_type"),
            WorkoutSession.workout_session_id,
            WorkoutSession.routine_id,
            Routine.routine_name.label("routine_name"),
            WorkoutSession.split_id,
            Split.split_name.label("split_name"),
            WorkoutSession.start_time,
            func.count(ExerciseSet.set_id).label("set_count"),
            func.coalesce(func.sum(ExerciseSet.reps), 0).label("rep_count"),
            func.max(ExerciseSet.weight).label("max_weight"),
            func.avg(ExerciseSet.weight).label("average_weight"),
            func.coalesce(func.sum(ExerciseSet.duration_seconds), 0).label("total_duration_seconds"),
            func.max(ExerciseSet.duration_seconds).label("max_duration_seconds"),
            func.sum(ExerciseSet.distance).label("total_distance"),
        )
        .join(WorkoutSession, SessionExercise.workout_session_id == WorkoutSession.workout_session_id)
        .join(Exercise, SessionExercise.exercise_id == Exercise.exercise_id)
        .outerjoin(Routine, WorkoutSession.routine_id == Routine.routine_id)
        .outerjoin(Split, WorkoutSession.split_id == Split.split_id)
        .outerjoin(ExerciseSet, SessionExercise.session_exercise_id == ExerciseSet.session_exercise_id)
        .filter(WorkoutSession.user_id == user_id)
        .filter(WorkoutSession.status == WorkoutStatus.COMPLETED)
        .group_by(
            SessionExercise.session_exercise_id,
            SessionExercise.exercise_id,
            Exercise.name,
            Exercise.exercise_type,
            WorkoutSession.workout_session_id,
            WorkoutSession.routine_id,
            Routine.routine_name,
            WorkoutSession.split_id,
            Split.split_name,
            WorkoutSession.start_time,
        )
    )
    if exercise_id is not None:
        query = query.filter(SessionExercise.exercise_id == exercise_id)
    query = _filter_datetime_range(query, WorkoutSession.start_time, start_date, end_date)

    return [
        ProgressExercisePoint(
            average_weight=float(row.average_weight) if row.average_weight is not None else None,
            exercise_id=row.exercise_id,
            exercise_name=row.exercise_name,
            exercise_type=row.exercise_type.value,
            max_duration_seconds=row.max_duration_seconds,
            max_weight=row.max_weight,
            performed_at=row.start_time,
            rep_count=row.rep_count or 0,
            routine_id=row.routine_id,
            routine_name=row.routine_name,
            session_exercise_id=row.session_exercise_id,
            set_count=row.set_count or 0,
            split_id=row.split_id,
            split_name=row.split_name,
            total_distance=row.total_distance,
            total_duration_seconds=row.total_duration_seconds or 0,
            workout_session_id=row.workout_session_id,
        )
        for row in query.order_by(WorkoutSession.start_time.asc()).all()
    ]


def list_record_points(
    db: Session,
    *,
    user_id: int,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[ProgressRecordPoint]:
    query = (
        db.query(UserExerciseRecord, Exercise.name.label("exercise_name"), RecordType.name.label("record_type_name"))
        .join(Exercise, UserExerciseRecord.exercise_id == Exercise.exercise_id)
        .join(RecordType, UserExerciseRecord.record_type_id == RecordType.record_type_id)
        .filter(UserExerciseRecord.user_id == user_id)
    )
    query = _filter_datetime_range(query, UserExerciseRecord.achieved_at, start_date, end_date)
    return [
        ProgressRecordPoint(
            achieved_at=record.achieved_at,
            exercise_id=record.exercise_id,
            exercise_name=exercise_name,
            is_current=record.is_current,
            record_id=record.record_id,
            record_type_id=record.record_type_id,
            record_type_name=record_type_name,
            value=record.value,
        )
        for record, exercise_name, record_type_name in query.order_by(UserExerciseRecord.achieved_at.asc()).all()
    ]


def get_progress_summary(
    db: Session,
    *,
    user_id: int,
    start_date: date | None = None,
    end_date: date | None = None,
) -> ProgressSummary:
    measurements = list_body_measurement_points(db, user_id=user_id, start_date=start_date, end_date=end_date)
    workouts = list_workout_points(db, user_id=user_id, start_date=start_date, end_date=end_date)
    routines = list_routine_points(db, user_id=user_id, start_date=start_date, end_date=end_date)
    records = list_record_points(db, user_id=user_id, start_date=start_date, end_date=end_date)
    workout_durations = [workout.duration_minutes for workout in workouts if workout.duration_minutes is not None]
    active_days = len({workout.start_time.date() for workout in workouts})

    first_weight = next((measurement.weight_kg for measurement in measurements if measurement.weight_kg is not None), None)
    last_weight = next(
        (measurement.weight_kg for measurement in reversed(measurements) if measurement.weight_kg is not None),
        None,
    )

    return ProgressSummary(
        active_days=active_days,
        average_workout_duration_minutes=(
            round(sum(workout_durations) / len(workout_durations), 1)
            if workout_durations
            else None
        ),
        cumulative_workouts=len(workouts),
        record_changes=len(records),
        routines_ended=len([routine for routine in routines if routine.end_date is not None]),
        routines_started=len([routine for routine in routines if routine.start_date is not None]),
        weight_change_kg=(
            round(last_weight - first_weight, 1)
            if first_weight is not None and last_weight is not None
            else None
        ),
    )


def aggregate_body_measurements(
    db: Session,
    *,
    user_id: int,
    period: AggregationPeriod,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[ProgressAggregatePoint]:
    rows = list_body_measurement_points(db, user_id=user_id, start_date=start_date, end_date=end_date)
    return aggregate_time_series(
        rows,
        date_getter=lambda row: row.measured_at,
        period=period,
        metrics={
            "weight_kg": lambda items: _average([item.weight_kg for item in items]),
            "body_fat_percentage": lambda items: _average([item.body_fat_percentage for item in items]),
            "height_cm": lambda items: _average([item.height_cm for item in items]),
        },
    )


def aggregate_workouts(
    db: Session,
    *,
    user_id: int,
    period: AggregationPeriod,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[ProgressAggregatePoint]:
    rows = list_workout_points(db, user_id=user_id, start_date=start_date, end_date=end_date)
    return aggregate_time_series(
        rows,
        date_getter=lambda row: row.start_time,
        period=period,
        metrics={
            "workout_count": len,
            "average_duration_minutes": lambda items: _average([item.duration_minutes for item in items]),
            "set_count": lambda items: sum(item.set_count for item in items),
        },
    )


def aggregate_exercise_performance(
    db: Session,
    *,
    user_id: int,
    period: AggregationPeriod,
    exercise_id: int | None = None,
    start_date: date | None = None,
    end_date: date | None = None,
) -> list[ProgressAggregatePoint]:
    rows = list_exercise_performance_points(
        db,
        user_id=user_id,
        exercise_id=exercise_id,
        start_date=start_date,
        end_date=end_date,
    )
    return aggregate_time_series(
        rows,
        date_getter=lambda row: row.performed_at,
        period=period,
        metrics={
            "max_weight": lambda items: _max([item.max_weight for item in items]),
            "average_weight": lambda items: _average([item.average_weight for item in items]),
            "set_count": lambda items: sum(item.set_count for item in items),
            "rep_count": lambda items: sum(item.rep_count for item in items),
            "total_duration_seconds": lambda items: sum(item.total_duration_seconds for item in items),
            "max_duration_seconds": lambda items: _max([item.max_duration_seconds for item in items]),
            "total_distance": lambda items: _sum_nullable([item.total_distance for item in items]),
        },
    )


def _average(values: list[float | int | None]) -> float | None:
    clean_values = [float(value) for value in values if value is not None]
    if not clean_values:
        return None
    return round(sum(clean_values) / len(clean_values), 2)


def _max(values: list[float | int | None]) -> float | int | None:
    clean_values = [value for value in values if value is not None]
    return max(clean_values) if clean_values else None


def _sum_nullable(values: list[float | int | None]) -> float | int | None:
    clean_values = [value for value in values if value is not None]
    return sum(clean_values) if clean_values else None


def _filter_datetime_range(query, column, start_date: date | None, end_date: date | None):
    if start_date is not None:
        query = query.filter(func.date(column) >= start_date)
    if end_date is not None:
        query = query.filter(func.date(column) <= end_date)
    return query
