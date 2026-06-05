from datetime import date

from app.api.crud.base import CRUDBase
from models.programming import Routine, RoutineSplit, Split, SplitExercise
from schemas.programming import RoutineCreate, RoutineFullCreate, RoutineUpdate
from sqlalchemy.orm import Session, joinedload


routine_crud = CRUDBase[Routine, RoutineCreate, RoutineUpdate](Routine, "Routine")


def list_routines_with_details(
    db: Session,
    *,
    user_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Routine]:
    query = _routine_detail_query(db)
    if user_id is not None:
        query = query.filter((Routine.created_by_user_id == user_id) | (Routine.is_global.is_(True)))
    routines = query.offset(skip).limit(limit).all()
    return [_sort_routine(routine) for routine in routines]


def list_user_routines_with_details(
    db: Session,
    *,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
) -> list[Routine]:
    routines = (
        _routine_detail_query(db)
        .filter(Routine.created_by_user_id == user_id)
        .order_by(Routine.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return [_sort_routine(routine) for routine in routines]


def get_active_routine_with_details(db: Session, *, user_id: int) -> Routine | None:
    routine = (
        _routine_detail_query(db)
        .filter(Routine.created_by_user_id == user_id)
        .filter(Routine.is_active.is_(True))
        .order_by(Routine.created_at.desc())
        .first()
    )
    if routine is None:
        return None
    return _sort_routine(routine)


def create_full_routine(db: Session, *, payload: RoutineFullCreate, user_id: int) -> Routine:
    routine = Routine(
        created_by_user_id=user_id,
        routine_name=payload.routine_name,
        description=payload.description,
        routine_type=payload.routine_type,
        goal=payload.goal,
        intensity=payload.intensity,
        is_global=payload.is_global,
        is_active=False,
    )
    db.add(routine)
    db.flush()

    for split_payload in sorted(payload.splits, key=lambda split: split.split_order):
        split = Split(
            created_by_user_id=user_id,
            split_name=split_payload.split_name,
            is_global=payload.is_global,
        )
        db.add(split)
        db.flush()

        db.add(
            RoutineSplit(
                routine_id=routine.routine_id,
                split_id=split.split_id,
                split_order=split_payload.split_order,
                day_of_week=split_payload.day_of_week,
            )
        )

        for exercise_payload in sorted(split_payload.exercises, key=lambda exercise: exercise.exercise_order):
            db.add(
                SplitExercise(
                    split_id=split.split_id,
                    exercise_id=exercise_payload.exercise_id,
                    exercise_order=exercise_payload.exercise_order,
                    default_sets=exercise_payload.default_sets,
                    default_reps=exercise_payload.default_reps,
                    default_weight_value=exercise_payload.default_weight_value,
                    default_weight_unit=exercise_payload.default_weight_unit,
                    default_duration_seconds=exercise_payload.default_duration_seconds,
                    default_distance=exercise_payload.default_distance,
                    notes=exercise_payload.notes,
                )
            )

    if payload.start_now:
        set_active_routine(db, routine=routine, user_id=user_id)

    db.flush()
    detailed_routine = get_routine_with_details(db, routine_id=routine.routine_id, user_id=user_id)
    if detailed_routine is None:
        raise RuntimeError("Created routine could not be loaded")
    return detailed_routine


def set_active_routine(db: Session, *, routine: Routine, user_id: int) -> Routine:
    today = date.today()
    current_active_routines = (
        db.query(Routine)
        .filter(Routine.created_by_user_id == user_id)
        .filter(Routine.is_active.is_(True))
        .all()
    )

    for active_routine in current_active_routines:
        if active_routine.routine_id == routine.routine_id:
            continue
        active_routine.is_active = False
        active_routine.end_date = today
        db.add(active_routine)

    routine.is_active = True
    routine.start_date = today
    routine.end_date = None
    db.add(routine)
    return routine


def get_routine_with_details(db: Session, *, routine_id: int, user_id: int | None = None) -> Routine | None:
    query = _routine_detail_query(db).filter(Routine.routine_id == routine_id)
    if user_id is not None:
        query = query.filter((Routine.created_by_user_id == user_id) | (Routine.is_global.is_(True)))
    routine = query.first()
    if routine is None:
        return None
    return _sort_routine(routine)


def _routine_detail_query(db: Session):
    return db.query(Routine).options(
        joinedload(Routine.routine_splits)
        .joinedload(RoutineSplit.split)
        .joinedload(Split.split_exercises)
        .joinedload(SplitExercise.exercise),
    )


def _sort_routine(routine: Routine) -> Routine:
    routine.routine_splits.sort(key=lambda routine_split: routine_split.split_order)
    for routine_split in routine.routine_splits:
        routine_split.split.split_exercises.sort(
            key=lambda split_exercise: split_exercise.exercise_order,
        )
    return routine
