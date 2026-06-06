from datetime import date, datetime, timedelta, timezone

from app.api.crud.base import CRUDBase
from app.api.crud.programming import get_active_routine_with_details
from models.programming import RoutineSplit, Split
from models.workouts import ExerciseSet, SessionExercise, SessionExerciseStatus, WorkoutSession, WorkoutStatus
from schemas.workouts import CurrentWorkout, CurrentWorkoutExercise
from schemas.workouts import (
    CompleteWorkoutRequest,
    WorkoutHistoryExercise,
    WorkoutHistoryItem,
    WorkoutHistorySet,
    WorkoutSessionCreate,
    WorkoutSessionUpdate,
)
from sqlalchemy.orm import Session, joinedload


workout_session_crud = CRUDBase[WorkoutSession, WorkoutSessionCreate, WorkoutSessionUpdate](
    WorkoutSession,
    "Workout session",
)

DAY_INDEX = {
    "MONDAY": 0,
    "TUESDAY": 1,
    "WEDNESDAY": 2,
    "THURSDAY": 3,
    "FRIDAY": 4,
    "SATURDAY": 5,
    "SUNDAY": 6,
}


def get_current_workout(db: Session, *, user_id: int, today: date | None = None) -> CurrentWorkout:
    today = today or date.today()
    in_progress_session = _get_in_progress_session(db, user_id=user_id)
    if in_progress_session is not None:
        return _current_workout_from_session(in_progress_session, state="IN_PROGRESS_SESSION")

    active_routine = get_active_routine_with_details(db, user_id=user_id)
    if active_routine is None:
        return CurrentWorkout(state="NO_ACTIVE_ROUTINE")

    incomplete_session = _get_incomplete_session(db, user_id=user_id, routine_id=active_routine.routine_id)
    if incomplete_session is not None and incomplete_session.split is not None:
        routine_split = _find_routine_split(active_routine.routine_splits, incomplete_session.split_id)
        return _current_workout_from_split(
            state="INCOMPLETE_SESSION",
            routine_id=active_routine.routine_id,
            routine_name=active_routine.routine_name,
            routine_split=routine_split,
            split=incomplete_session.split,
            scheduled_date=incomplete_session.start_time.date(),
            workout_session_id=incomplete_session.workout_session_id,
            status=incomplete_session.status,
        )

    next_routine_split = _find_next_incomplete_split(
        db,
        user_id=user_id,
        routine_id=active_routine.routine_id,
        routine_splits=active_routine.routine_splits,
        today=today,
    )
    if next_routine_split is None:
        return CurrentWorkout(
            state="NO_SCHEDULED_WORKOUT",
            routine_id=active_routine.routine_id,
            routine_name=active_routine.routine_name,
        )

    routine_split, scheduled_date = next_routine_split
    return _current_workout_from_split(
        state="NEXT_SCHEDULED",
        routine_id=active_routine.routine_id,
        routine_name=active_routine.routine_name,
        routine_split=routine_split,
        split=routine_split.split,
        scheduled_date=scheduled_date,
        workout_session_id=None,
        status=None,
    )


def start_workout(db: Session, *, user_id: int, source: str, today: date | None = None) -> CurrentWorkout:
    today = today or date.today()
    in_progress_session = _get_in_progress_session(db, user_id=user_id)
    if in_progress_session is not None:
        _abandon_other_in_progress_sessions(
            db,
            user_id=user_id,
            keep_workout_session_id=in_progress_session.workout_session_id,
        )
        return _current_workout_from_session(in_progress_session, state="IN_PROGRESS_SESSION")

    if source == "empty":
        session = WorkoutSession(
            user_id=user_id,
            routine_id=None,
            split_id=None,
            start_time=datetime.now(timezone.utc),
            status=WorkoutStatus.IN_PROGRESS,
        )
        db.add(session)
        db.flush()
        return _current_workout_from_session(session, state="IN_PROGRESS_SESSION")

    active_routine = get_active_routine_with_details(db, user_id=user_id)
    if active_routine is None:
        return CurrentWorkout(state="NO_ACTIVE_ROUTINE")

    next_routine_split = _find_next_incomplete_split(
        db,
        user_id=user_id,
        routine_id=active_routine.routine_id,
        routine_splits=active_routine.routine_splits,
        today=today,
    )
    if next_routine_split is None:
        return CurrentWorkout(
            state="NO_SCHEDULED_WORKOUT",
            routine_id=active_routine.routine_id,
            routine_name=active_routine.routine_name,
        )

    routine_split, _scheduled_date = next_routine_split
    session = WorkoutSession(
        user_id=user_id,
        routine_id=active_routine.routine_id,
        split_id=routine_split.split_id,
        start_time=datetime.now(timezone.utc),
        status=WorkoutStatus.IN_PROGRESS,
    )
    db.add(session)
    db.flush()

    for split_exercise in sorted(routine_split.split.split_exercises, key=lambda item: item.exercise_order):
        db.add(
            SessionExercise(
                workout_session_id=session.workout_session_id,
                exercise_id=split_exercise.exercise_id,
                source_split_exercise_id=split_exercise.split_exercise_id,
                exercise_order=split_exercise.exercise_order,
                status=SessionExerciseStatus.PARTIAL,
                notes=split_exercise.notes,
            )
        )

    db.flush()
    return _current_workout_from_session(session, state="IN_PROGRESS_SESSION", routine_split=routine_split)


def complete_workout(
    db: Session,
    *,
    workout_session_id: int,
    user_id: int,
    payload: CompleteWorkoutRequest,
) -> CurrentWorkout:
    session = (
        db.query(WorkoutSession)
        .options(joinedload(WorkoutSession.session_exercises).joinedload(SessionExercise.exercise_sets))
        .filter(WorkoutSession.workout_session_id == workout_session_id)
        .filter(WorkoutSession.user_id == user_id)
        .first()
    )
    if session is None:
        raise ValueError("Workout session not found")

    now = datetime.now(timezone.utc)
    session.session_exercises.clear()
    db.flush()

    for exercise_payload in sorted(payload.exercises, key=lambda exercise: exercise.exercise_order):
        session_exercise = SessionExercise(
            workout_session_id=session.workout_session_id,
            exercise_id=exercise_payload.exercise_id,
            source_split_exercise_id=exercise_payload.source_split_exercise_id,
            exercise_order=exercise_payload.exercise_order,
            status=exercise_payload.status,
            notes=exercise_payload.notes,
        )
        db.add(session_exercise)
        db.flush()

        for set_payload in sorted(exercise_payload.sets, key=lambda exercise_set: exercise_set.set_number):
            db.add(
                ExerciseSet(
                    session_exercise_id=session_exercise.session_exercise_id,
                    set_number=set_payload.set_number,
                    reps=set_payload.reps,
                    weight=set_payload.weight,
                    duration_seconds=set_payload.duration_seconds,
                    distance=set_payload.distance,
                    intensity=set_payload.intensity,
                    notes=set_payload.notes,
                )
            )

    session.status = WorkoutStatus.COMPLETED
    session.end_time = now
    session.notes = payload.notes
    db.add(session)
    _abandon_other_in_progress_sessions(
        db,
        user_id=user_id,
        keep_workout_session_id=session.workout_session_id,
        end_time=now,
    )
    db.flush()
    return get_current_workout(db, user_id=user_id)


def list_completed_workouts_with_details(
    db: Session,
    *,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
) -> list[WorkoutHistoryItem]:
    sessions = (
        db.query(WorkoutSession)
        .options(
            joinedload(WorkoutSession.routine),
            joinedload(WorkoutSession.split),
            joinedload(WorkoutSession.session_exercises).joinedload(SessionExercise.exercise),
            joinedload(WorkoutSession.session_exercises).joinedload(SessionExercise.exercise_sets),
        )
        .filter(WorkoutSession.user_id == user_id)
        .filter(WorkoutSession.status == WorkoutStatus.COMPLETED)
        .order_by(WorkoutSession.start_time.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_workout_history_item(session) for session in sessions]


def _get_in_progress_session(db: Session, *, user_id: int) -> WorkoutSession | None:
    return (
        db.query(WorkoutSession)
        .options(
            joinedload(WorkoutSession.routine),
            joinedload(WorkoutSession.split),
            joinedload(WorkoutSession.session_exercises).joinedload(SessionExercise.exercise),
            joinedload(WorkoutSession.session_exercises).joinedload(SessionExercise.source_split_exercise),
        )
        .filter(WorkoutSession.user_id == user_id)
        .filter(WorkoutSession.status == WorkoutStatus.IN_PROGRESS)
        .order_by(WorkoutSession.start_time.desc())
        .first()
    )


def _abandon_other_in_progress_sessions(
    db: Session,
    *,
    user_id: int,
    keep_workout_session_id: int,
    end_time: datetime | None = None,
) -> None:
    end_time = end_time or datetime.now(timezone.utc)
    stale_sessions = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user_id)
        .filter(WorkoutSession.status == WorkoutStatus.IN_PROGRESS)
        .filter(WorkoutSession.workout_session_id != keep_workout_session_id)
        .all()
    )
    for stale_session in stale_sessions:
        stale_session.status = WorkoutStatus.ABANDONED
        stale_session.end_time = stale_session.end_time or end_time
        db.add(stale_session)


def _get_incomplete_session(db: Session, *, user_id: int, routine_id: int) -> WorkoutSession | None:
    return (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user_id)
        .filter(WorkoutSession.routine_id == routine_id)
        .filter(WorkoutSession.status.in_([WorkoutStatus.IN_PROGRESS, WorkoutStatus.PLANNED]))
        .order_by(WorkoutSession.start_time.asc())
        .first()
    )


def _current_workout_from_session(
    session: WorkoutSession,
    *,
    state: str,
    routine_split: RoutineSplit | None = None,
) -> CurrentWorkout:
    if routine_split is None and session.routine is not None and session.split_id is not None:
        routine_split = _find_routine_split(session.routine.routine_splits, session.split_id)

    return CurrentWorkout(
        state=state,
        routine_id=session.routine_id,
        routine_name=session.routine.routine_name if session.routine else None,
        split_id=session.split_id,
        split_name=session.split.split_name if session.split else None,
        day_of_week=routine_split.day_of_week if routine_split else None,
        scheduled_date=session.start_time.date(),
        workout_session_id=session.workout_session_id,
        status=session.status,
        exercises=[
            CurrentWorkoutExercise(
                source_split_exercise_id=session_exercise.source_split_exercise_id,
                exercise_id=session_exercise.exercise_id,
                name=session_exercise.exercise.name,
                exercise_type=session_exercise.exercise.exercise_type,
                equipment=session_exercise.exercise.equipment,
                preparation=session_exercise.exercise.preparation,
                execution=session_exercise.exercise.execution,
                exercise_order=session_exercise.exercise_order,
                status=session_exercise.status,
                default_sets=(
                    session_exercise.source_split_exercise.default_sets
                    if session_exercise.source_split_exercise
                    else None
                ),
                default_reps=(
                    session_exercise.source_split_exercise.default_reps
                    if session_exercise.source_split_exercise
                    else None
                ),
                default_weight_value=(
                    session_exercise.source_split_exercise.default_weight_value
                    if session_exercise.source_split_exercise
                    else None
                ),
                default_weight_unit=(
                    session_exercise.source_split_exercise.default_weight_unit
                    if session_exercise.source_split_exercise
                    else None
                ),
                default_duration_seconds=(
                    session_exercise.source_split_exercise.default_duration_seconds
                    if session_exercise.source_split_exercise
                    else None
                ),
                default_distance=(
                    session_exercise.source_split_exercise.default_distance
                    if session_exercise.source_split_exercise
                    else None
                ),
                notes=session_exercise.notes,
            )
            for session_exercise in sorted(session.session_exercises, key=lambda item: item.exercise_order)
        ],
    )


def _workout_history_item(session: WorkoutSession) -> WorkoutHistoryItem:
    return WorkoutHistoryItem(
        workout_session_id=session.workout_session_id,
        routine_id=session.routine_id,
        routine_name=session.routine.routine_name if session.routine else None,
        split_id=session.split_id,
        split_name=session.split.split_name if session.split else None,
        start_time=session.start_time,
        end_time=session.end_time,
        status=session.status,
        notes=session.notes,
        exercises=[
            WorkoutHistoryExercise(
                session_exercise_id=session_exercise.session_exercise_id,
                exercise_id=session_exercise.exercise_id,
                name=session_exercise.exercise.name,
                exercise_order=session_exercise.exercise_order,
                status=session_exercise.status,
                notes=session_exercise.notes,
                sets=[
                    WorkoutHistorySet(
                        set_id=exercise_set.set_id,
                        set_number=exercise_set.set_number,
                        reps=exercise_set.reps,
                        weight=exercise_set.weight,
                        duration_seconds=exercise_set.duration_seconds,
                        distance=exercise_set.distance,
                        intensity=exercise_set.intensity,
                        notes=exercise_set.notes,
                    )
                    for exercise_set in sorted(session_exercise.exercise_sets, key=lambda item: item.set_number)
                ],
            )
            for session_exercise in sorted(session.session_exercises, key=lambda item: item.exercise_order)
        ],
    )


def _find_next_incomplete_split(
    db: Session,
    *,
    user_id: int,
    routine_id: int,
    routine_splits: list[RoutineSplit],
    today: date,
) -> tuple[RoutineSplit, date] | None:
    scheduled_splits = [routine_split for routine_split in routine_splits if routine_split.day_of_week]
    if not scheduled_splits:
        fallback_split = routine_splits[0] if routine_splits else None
        return (fallback_split, today) if fallback_split is not None else None

    completed_sessions = _completed_session_dates(db, user_id=user_id, routine_id=routine_id)
    week_start = today - timedelta(days=today.weekday())
    candidate_dates: list[tuple[RoutineSplit, date]] = []

    for week_offset in range(0, 3):
        for routine_split in scheduled_splits:
            day_index = DAY_INDEX.get(routine_split.day_of_week or "")
            if day_index is None:
                continue
            scheduled_date = week_start + timedelta(days=(week_offset * 7) + day_index)
            candidate_dates.append((routine_split, scheduled_date))

    candidate_dates.sort(key=lambda item: (item[1], item[0].split_order))

    past_or_today = [
        candidate
        for candidate in candidate_dates
        if candidate[1] <= today and not _is_completed(completed_sessions, candidate)
    ]
    if past_or_today:
        return past_or_today[0]

    future = [
        candidate
        for candidate in candidate_dates
        if candidate[1] > today and not _is_completed(completed_sessions, candidate)
    ]
    return future[0] if future else None


def _completed_session_dates(db: Session, *, user_id: int, routine_id: int) -> set[tuple[int, date]]:
    sessions = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user_id)
        .filter(WorkoutSession.routine_id == routine_id)
        .filter(WorkoutSession.status == WorkoutStatus.COMPLETED)
        .all()
    )
    return {
        (session.split_id, session.start_time.date())
        for session in sessions
        if session.split_id is not None
    }


def _is_completed(completed_sessions: set[tuple[int, date]], candidate: tuple[RoutineSplit, date]) -> bool:
    routine_split, scheduled_date = candidate
    return (routine_split.split_id, scheduled_date) in completed_sessions


def _find_routine_split(routine_splits: list[RoutineSplit], split_id: int | None) -> RoutineSplit | None:
    if split_id is None:
        return None
    return next((routine_split for routine_split in routine_splits if routine_split.split_id == split_id), None)


def _current_workout_from_split(
    *,
    state: str,
    routine_id: int,
    routine_name: str,
    routine_split: RoutineSplit | None,
    split: Split,
    scheduled_date: date,
    workout_session_id: int | None,
    status: WorkoutStatus | None,
) -> CurrentWorkout:
    return CurrentWorkout(
        state=state,
        routine_id=routine_id,
        routine_name=routine_name,
        split_id=split.split_id,
        split_name=split.split_name,
        day_of_week=routine_split.day_of_week if routine_split else None,
        scheduled_date=scheduled_date,
        workout_session_id=workout_session_id,
        status=status,
        exercises=[
            CurrentWorkoutExercise(
                source_split_exercise_id=split_exercise.split_exercise_id,
                exercise_id=split_exercise.exercise_id,
                name=split_exercise.exercise.name,
                exercise_type=split_exercise.exercise.exercise_type,
                equipment=split_exercise.exercise.equipment,
                preparation=split_exercise.exercise.preparation,
                execution=split_exercise.exercise.execution,
                exercise_order=split_exercise.exercise_order,
                default_sets=split_exercise.default_sets,
                default_reps=split_exercise.default_reps,
                default_weight_value=split_exercise.default_weight_value,
                default_weight_unit=split_exercise.default_weight_unit,
                default_duration_seconds=split_exercise.default_duration_seconds,
                default_distance=split_exercise.default_distance,
                notes=split_exercise.notes,
            )
            for split_exercise in split.split_exercises
        ],
    )
