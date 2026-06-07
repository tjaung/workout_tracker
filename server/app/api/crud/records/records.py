from datetime import datetime, timezone

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from models.exercises import ComparisonType, Exercise, ExerciseType, RecordCategory, RecordType
from models.programming import Routine, RoutineSplit, SplitExercise
from models.workouts import (
    ExerciseSet,
    RecordSource,
    SessionExercise,
    UserExerciseRecord,
    WorkoutSession,
    WorkoutStatus,
)
from schemas.records import (
    ExerciseRecordSummary,
    ExerciseRecordValue,
    ManualExerciseRecordRequest,
    RecordExerciseOption,
)


ONE_REP_MAX_PERCENTAGES = {
    1: 1.00,
    2: 0.97,
    3: 0.94,
    4: 0.92,
    5: 0.89,
    6: 0.86,
    7: 0.83,
    8: 0.81,
    9: 0.78,
    10: 0.75,
    11: 0.73,
    12: 0.71,
    13: 0.70,
    14: 0.68,
    15: 0.67,
    16: 0.65,
    17: 0.64,
    18: 0.63,
    19: 0.61,
    20: 0.60,
    21: 0.59,
    22: 0.58,
    23: 0.57,
    24: 0.56,
    25: 0.55,
    26: 0.54,
    27: 0.53,
    28: 0.52,
    29: 0.51,
    30: 0.50,
}

RECORD_DEFINITIONS = {
    "one_rep_max": ("Estimated 1 rep max", RecordCategory.STRENGTH, ComparisonType.HIGHER_IS_BETTER, "lb"),
    "max_reps": ("Max reps", RecordCategory.STRENGTH, ComparisonType.HIGHER_IS_BETTER, "reps"),
    "max_sets": ("Max sets", RecordCategory.STRENGTH, ComparisonType.HIGHER_IS_BETTER, "sets"),
    "max_duration": ("Max duration", RecordCategory.TIME, ComparisonType.HIGHER_IS_BETTER, "seconds"),
    "max_distance": ("Max distance", RecordCategory.DISTANCE, ComparisonType.HIGHER_IS_BETTER, "mi"),
    "best_mile_time": ("Best mile time", RecordCategory.TIME, ComparisonType.LOWER_IS_BETTER, "seconds"),
    "mobility_duration": ("Longest mobility duration", RecordCategory.TIME, ComparisonType.HIGHER_IS_BETTER, "seconds"),
    "mobility_sessions": ("Mobility sessions", RecordCategory.ENDURANCE, ComparisonType.HIGHER_IS_BETTER, "sessions"),
}


def list_record_exercises(db: Session, *, user_id: int) -> list[RecordExerciseOption]:
    exercise_ids = _user_exercise_ids(db, user_id=user_id)
    if not exercise_ids:
        return []

    exercises = (
        db.query(Exercise)
        .filter(Exercise.exercise_id.in_(exercise_ids))
        .order_by(Exercise.name.asc())
        .all()
    )
    return [RecordExerciseOption.model_validate(exercise) for exercise in exercises]


def get_exercise_record_summary(db: Session, *, user_id: int, exercise_id: int) -> ExerciseRecordSummary:
    exercise = (
        db.query(Exercise)
        .filter(
            Exercise.exercise_id == exercise_id,
            or_(
                Exercise.exercise_id.in_(_user_exercise_ids(db, user_id=user_id)),
                Exercise.created_by_user_id == user_id,
            ),
        )
        .first()
    )
    if exercise is None:
        raise ValueError("Exercise is not available for records")

    computed = _computed_records(db, user_id=user_id, exercise=exercise)
    manual = _manual_records(db, user_id=user_id, exercise_id=exercise.exercise_id)
    records = [_record_value(key, value, manual) for key, value in computed.items()]

    return ExerciseRecordSummary(
        exercise=RecordExerciseOption.model_validate(exercise),
        records=records,
    )


def upsert_manual_exercise_records(
    db: Session,
    *,
    user_id: int,
    exercise_id: int,
    payload: ManualExerciseRecordRequest,
) -> ExerciseRecordSummary:
    for record in payload.records:
        if record.key not in RECORD_DEFINITIONS:
            continue

        record_type = _get_or_create_record_type(db, record.key)
        (
            db.query(UserExerciseRecord)
            .filter(
                UserExerciseRecord.user_id == user_id,
                UserExerciseRecord.exercise_id == exercise_id,
                UserExerciseRecord.record_type_id == record_type.record_type_id,
                UserExerciseRecord.is_current.is_(True),
            )
            .update({"is_current": False}, synchronize_session=False)
        )
        db.add(
            UserExerciseRecord(
                user_id=user_id,
                exercise_id=exercise_id,
                record_type_id=record_type.record_type_id,
                value=record.value,
                source=RecordSource.MANUAL,
                is_current=True,
                achieved_at=datetime.now(timezone.utc),
                notes=record.notes,
            )
        )

    db.flush()
    return get_exercise_record_summary(db, user_id=user_id, exercise_id=exercise_id)


def _user_exercise_ids(db: Session, *, user_id: int) -> set[int]:
    workout_ids = {
        exercise_id
        for (exercise_id,) in (
            db.query(SessionExercise.exercise_id)
            .join(WorkoutSession, SessionExercise.workout_session_id == WorkoutSession.workout_session_id)
            .filter(WorkoutSession.user_id == user_id)
            .distinct()
            .all()
        )
    }
    routine_ids = {
        exercise_id
        for (exercise_id,) in (
            db.query(SplitExercise.exercise_id)
            .join(RoutineSplit, SplitExercise.split_id == RoutineSplit.split_id)
            .join(Routine, RoutineSplit.routine_id == Routine.routine_id)
            .filter(Routine.created_by_user_id == user_id)
            .distinct()
            .all()
        )
    }
    return workout_ids | routine_ids


def _computed_records(db: Session, *, user_id: int, exercise: Exercise) -> dict[str, float | None]:
    rows = (
        db.query(ExerciseSet)
        .join(SessionExercise, ExerciseSet.session_exercise_id == SessionExercise.session_exercise_id)
        .join(WorkoutSession, SessionExercise.workout_session_id == WorkoutSession.workout_session_id)
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == WorkoutStatus.COMPLETED,
            SessionExercise.exercise_id == exercise.exercise_id,
        )
        .all()
    )

    if exercise.exercise_type in {ExerciseType.WEIGHT, ExerciseType.BODYWEIGHT}:
        max_sets = _max_sets(db, user_id=user_id, exercise_id=exercise.exercise_id)
        return {
            "one_rep_max": _estimated_one_rep_max(rows),
            "max_reps": _max_or_none([row.reps for row in rows]),
            "max_sets": max_sets,
        }

    if exercise.exercise_type == ExerciseType.CARDIO:
        return {
            "max_duration": _max_or_none([row.duration_seconds for row in rows]),
            "max_distance": _max_or_none([row.distance for row in rows]),
            "best_mile_time": _best_mile_time(rows),
        }

    if exercise.exercise_type == ExerciseType.MOBILITY:
        return {
            "mobility_duration": _max_or_none([row.duration_seconds for row in rows]),
            "mobility_sessions": _session_count(db, user_id=user_id, exercise_id=exercise.exercise_id),
        }

    return {
        "max_duration": _max_or_none([row.duration_seconds for row in rows]),
        "max_sets": _max_sets(db, user_id=user_id, exercise_id=exercise.exercise_id),
    }


def _manual_records(db: Session, *, user_id: int, exercise_id: int) -> dict[str, UserExerciseRecord]:
    rows = (
        db.query(UserExerciseRecord, RecordType.name.label("record_type_name"))
        .join(RecordType, UserExerciseRecord.record_type_id == RecordType.record_type_id)
        .filter(
            UserExerciseRecord.user_id == user_id,
            UserExerciseRecord.exercise_id == exercise_id,
            UserExerciseRecord.source == RecordSource.MANUAL,
            UserExerciseRecord.is_current.is_(True),
        )
        .all()
    )
    return {record_type_name: record for record, record_type_name in rows}


def _record_value(
    key: str,
    computed_value: float | None,
    manual_records: dict[str, UserExerciseRecord],
) -> ExerciseRecordValue:
    label, _, _, unit = RECORD_DEFINITIONS[key]
    manual = manual_records.get(key)
    value = manual.value if manual is not None else computed_value
    source = manual.source if manual is not None else RecordSource.ESTIMATED
    return ExerciseRecordValue(
        key=key,
        label=label,
        value=value,
        unit=unit,
        source=source,
        display_value=_display_value(value, unit),
    )


def _get_or_create_record_type(db: Session, key: str) -> RecordType:
    record_type = db.query(RecordType).filter(RecordType.name == key).first()
    if record_type is not None:
        return record_type

    _, category, comparison_type, unit = RECORD_DEFINITIONS[key]
    record_type = RecordType(
        name=key,
        record_category=category,
        comparison_type=comparison_type,
        default_unit=unit,
    )
    db.add(record_type)
    db.flush()
    return record_type


def _estimated_one_rep_max(rows: list[ExerciseSet]) -> float | None:
    values: list[float] = []
    for row in rows:
        if row.weight is None or row.reps is None or row.reps <= 0:
            continue
        percentage = ONE_REP_MAX_PERCENTAGES.get(min(row.reps, 30))
        if percentage:
            values.append(row.weight / percentage)
    return round(max(values), 1) if values else None


def _best_mile_time(rows: list[ExerciseSet]) -> float | None:
    paces: list[float] = []
    for row in rows:
        if row.duration_seconds is None or row.distance is None or row.distance <= 0:
            continue
        paces.append(row.duration_seconds / row.distance)
    return round(min(paces), 1) if paces else None


def _max_sets(db: Session, *, user_id: int, exercise_id: int) -> float | None:
    counts = (
        db.query(func.count(ExerciseSet.set_id))
        .join(SessionExercise, ExerciseSet.session_exercise_id == SessionExercise.session_exercise_id)
        .join(WorkoutSession, SessionExercise.workout_session_id == WorkoutSession.workout_session_id)
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == WorkoutStatus.COMPLETED,
            SessionExercise.exercise_id == exercise_id,
        )
        .group_by(SessionExercise.session_exercise_id)
        .all()
    )
    values = [count for (count,) in counts]
    return float(max(values)) if values else None


def _session_count(db: Session, *, user_id: int, exercise_id: int) -> float:
    return float(
        db.query(SessionExercise.session_exercise_id)
        .join(WorkoutSession, SessionExercise.workout_session_id == WorkoutSession.workout_session_id)
        .filter(
            WorkoutSession.user_id == user_id,
            WorkoutSession.status == WorkoutStatus.COMPLETED,
            SessionExercise.exercise_id == exercise_id,
        )
        .distinct()
        .count()
    )


def _max_or_none(values: list[float | int | None]) -> float | None:
    clean_values = [float(value) for value in values if value is not None]
    return max(clean_values) if clean_values else None


def _display_value(value: float | None, unit: str) -> str:
    if value is None:
        return "No data"
    if unit == "seconds":
        minutes = int(value) // 60
        seconds = int(value) % 60
        if minutes >= 60:
            hours = minutes // 60
            minutes = minutes % 60
            return f"{hours}h {minutes}m {seconds}s"
        return f"{minutes}m {seconds}s"
    if unit in {"reps", "sets", "sessions"}:
        return f"{int(value)} {unit}"
    return f"{value:.1f} {unit}"
