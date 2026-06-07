from dataclasses import dataclass
from datetime import UTC, date, datetime, time, timedelta

from sqlalchemy.orm import Session

from core.database import SessionLocal
from core.logger import logger
from models.exercises import Exercise, ExerciseType
from models.programming import (
    Routine,
    RoutineGoal,
    RoutineIntensity,
    RoutineSplit,
    RoutineType,
    Split,
    SplitExercise,
    WeightUnit,
)
from models.users import BodyMeasurement, User
from models.workouts import ExerciseSet, SessionExercise, SessionExerciseStatus, WorkoutSession, WorkoutStatus
from services.seed_public_data.seed_default_user import DEFAULT_USER_USERNAME


UPPER_LOWER_ROUTINE_NAME = "Test Upper Lower Weight Loss"
CARDIO_ROUTINE_NAME = "Test Cardio Transition"


@dataclass(frozen=True)
class ExercisePlan:
    name: str
    equipment: str | None
    sets: int | None = None
    reps: int | None = None
    weight: float | None = None
    weight_unit: WeightUnit | None = None
    duration_seconds: int | None = None
    distance: float | None = None
    intensity: str | None = None


@dataclass(frozen=True)
class SplitPlan:
    name: str
    day_of_week: str
    exercises: tuple[ExercisePlan, ...]


UPPER_LOWER_SPLITS = (
    SplitPlan(
        name="Upper A",
        day_of_week="MONDAY",
        exercises=(
            ExercisePlan("Bench Press", "Barbell", sets=4, reps=6, weight=155, weight_unit=WeightUnit.LB),
            ExercisePlan("Pulldown", "Cable", sets=4, reps=10, weight=110, weight_unit=WeightUnit.LB),
            ExercisePlan("Shoulder Press", "Dumbbell", sets=3, reps=10, weight=35, weight_unit=WeightUnit.LB),
            ExercisePlan("Curl", "Dumbbell", sets=3, reps=12, weight=25, weight_unit=WeightUnit.LB),
        ),
    ),
    SplitPlan(
        name="Lower A",
        day_of_week="TUESDAY",
        exercises=(
            ExercisePlan("Squat", "Barbell", sets=4, reps=6, weight=205, weight_unit=WeightUnit.LB),
            ExercisePlan("Straight-leg Deadlift", "Barbell", sets=3, reps=8, weight=155, weight_unit=WeightUnit.LB),
            ExercisePlan("Lunge", "Dumbbell", sets=3, reps=10, weight=35, weight_unit=WeightUnit.LB),
            ExercisePlan("Standing Calf Raise", "Dumbbell", sets=3, reps=15, weight=45, weight_unit=WeightUnit.LB),
        ),
    ),
    SplitPlan(
        name="Upper B",
        day_of_week="THURSDAY",
        exercises=(
            ExercisePlan("Push-up", "Body Weight", sets=4, reps=12),
            ExercisePlan("Pull-up", "Body Weight", sets=4, reps=6),
            ExercisePlan("Bench Dip", "Body Weight", sets=3, reps=12),
            ExercisePlan("Curl", "Barbell", sets=3, reps=10, weight=60, weight_unit=WeightUnit.LB),
        ),
    ),
    SplitPlan(
        name="Lower B",
        day_of_week="FRIDAY",
        exercises=(
            ExercisePlan("Deadlifts", "Barbell", sets=3, reps=5, weight=245, weight_unit=WeightUnit.LB),
            ExercisePlan("Leg Presses", "Sled", sets=3, reps=10, weight=300, weight_unit=WeightUnit.LB),
            ExercisePlan("Step-up", "Body Weight", sets=3, reps=12),
            ExercisePlan("Squat", "Body Weight", sets=3, reps=15),
        ),
    ),
)

CARDIO_SPLITS = (
    SplitPlan(
        name="Walk Run Intervals",
        day_of_week="MONDAY",
        exercises=(
            ExercisePlan("Walk", "Body Weight", duration_seconds=300, distance=0.25, intensity="warm up"),
            ExercisePlan("Jog", "Body Weight", duration_seconds=1500, distance=1.8, intensity="moderate"),
            ExercisePlan("Walk", "Body Weight", duration_seconds=300, distance=0.25, intensity="cool down"),
        ),
    ),
    SplitPlan(
        name="Easy Cardio",
        day_of_week="WEDNESDAY",
        exercises=(
            ExercisePlan("Run", "Body Weight", duration_seconds=1200, distance=1.6, intensity="easy"),
            ExercisePlan("Walk", "Body Weight", duration_seconds=300, distance=0.25, intensity="cool down"),
        ),
    ),
    SplitPlan(
        name="Long Easy Day",
        day_of_week="SATURDAY",
        exercises=(
            ExercisePlan("Run", "Body Weight", duration_seconds=1800, distance=2.4, intensity="conversational"),
            ExercisePlan("Walk", "Body Weight", duration_seconds=300, distance=0.25, intensity="cool down"),
        ),
    ),
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


def seed_test_user_history() -> None:
    db = SessionLocal()
    try:
        _seed_test_user_history(db)
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Test user history seed failed")
        raise
    finally:
        db.close()


def _seed_test_user_history(db: Session) -> None:
    user = db.query(User).filter(User.username == DEFAULT_USER_USERNAME).first()
    if user is None:
        logger.warning("Test user history seed skipped: default user does not exist")
        return

    existing = (
        db.query(Routine)
        .filter(Routine.created_by_user_id == user.user_id)
        .filter(Routine.routine_name.in_([UPPER_LOWER_ROUTINE_NAME, CARDIO_ROUTINE_NAME]))
        .first()
    )
    if existing is not None:
        logger.info("Test user history seed skipped: history already exists")
        return

    today = date.today()
    last_saturday = today - timedelta(days=(today.weekday() - DAY_INDEX["SATURDAY"]) % 7)
    cardio_start = last_saturday - timedelta(days=6)
    upper_start = last_saturday - timedelta(weeks=13)
    upper_end = cardio_start - timedelta(days=1)

    db.query(Routine).filter(Routine.created_by_user_id == user.user_id).update(
        {Routine.is_active: False},
        synchronize_session=False,
    )

    _seed_measurements(db, user=user, start_date=upper_start, end_date=last_saturday)
    upper_routine = _create_routine(
        db,
        user=user,
        name=UPPER_LOWER_ROUTINE_NAME,
        description=(
            "The first routine test started after deciding to use the app: "
            "a consistent upper/lower split while losing weight."
        ),
        routine_type=RoutineType.WEIGHT_TRAINING,
        goal=RoutineGoal.WEIGHT_LOSS,
        intensity=RoutineIntensity.MODERATE,
        splits=UPPER_LOWER_SPLITS,
        start_date=upper_start,
        end_date=upper_end,
        is_active=False,
    )
    cardio_routine = _create_routine(
        db,
        user=user,
        name=CARDIO_ROUTINE_NAME,
        description="A newly added cardio routine after pausing the upper/lower split.",
        routine_type=RoutineType.CARDIO,
        goal=RoutineGoal.ENDURANCE,
        intensity=RoutineIntensity.LOW,
        splits=CARDIO_SPLITS,
        start_date=cardio_start,
        end_date=None,
        is_active=True,
    )

    _seed_workouts_for_routine(db, user=user, routine=upper_routine, start_date=upper_start, end_date=upper_end)
    _seed_workouts_for_routine(db, user=user, routine=cardio_routine, start_date=cardio_start, end_date=today)
    logger.info("Test user history seeded")


def _seed_measurements(db: Session, *, user: User, start_date: date, end_date: date) -> None:
    db.query(BodyMeasurement).filter(BodyMeasurement.user_id == user.user_id).update(
        {BodyMeasurement.is_current: False},
        synchronize_session=False,
    )

    measurement_dates: list[date] = []
    current = start_date
    while current <= end_date:
        measurement_dates.append(current)
        current += timedelta(days=7)

    starting_weight = 101.0
    ending_weight = 88.5
    starting_body_fat = 32.0
    ending_body_fat = 25.5
    steps = max(len(measurement_dates) - 1, 1)

    for index, measured_on in enumerate(measurement_dates):
        ratio = index / steps
        measurement = BodyMeasurement(
            user_id=user.user_id,
            measured_at=_at_time(measured_on, hour=8),
            height_cm=178.0,
            weight_kg=round(starting_weight + ((ending_weight - starting_weight) * ratio), 1),
            body_fat_percentage=round(starting_body_fat + ((ending_body_fat - starting_body_fat) * ratio), 1),
            is_current=index == len(measurement_dates) - 1,
            notes="Weekly Saturday check-in.",
        )
        db.add(measurement)


def _create_routine(
    db: Session,
    *,
    user: User,
    name: str,
    description: str,
    routine_type: RoutineType,
    goal: RoutineGoal,
    intensity: RoutineIntensity,
    splits: tuple[SplitPlan, ...],
    start_date: date,
    end_date: date | None,
    is_active: bool,
) -> Routine:
    routine = Routine(
        created_by_user_id=user.user_id,
        routine_name=name,
        description=description,
        routine_type=routine_type,
        goal=goal,
        intensity=intensity,
        is_global=False,
        is_active=is_active,
        start_date=start_date,
        end_date=end_date,
    )
    db.add(routine)
    db.flush()

    for split_order, split_plan in enumerate(splits, start=1):
        split = Split(
            created_by_user_id=user.user_id,
            split_name=split_plan.name,
            is_global=False,
        )
        db.add(split)
        db.flush()
        db.add(
            RoutineSplit(
                routine_id=routine.routine_id,
                split_id=split.split_id,
                split_order=split_order,
                day_of_week=split_plan.day_of_week,
            )
        )
        for exercise_order, exercise_plan in enumerate(split_plan.exercises, start=1):
            exercise = _get_or_create_exercise(db, exercise_plan)
            db.add(
                SplitExercise(
                    split_id=split.split_id,
                    exercise_id=exercise.exercise_id,
                    exercise_order=exercise_order,
                    default_sets=exercise_plan.sets,
                    default_reps=exercise_plan.reps,
                    default_weight_value=exercise_plan.weight,
                    default_weight_unit=exercise_plan.weight_unit,
                    default_duration_seconds=exercise_plan.duration_seconds,
                    default_distance=exercise_plan.distance,
                    notes=None,
                )
            )

    db.flush()
    db.refresh(routine)
    return routine


def _seed_workouts_for_routine(
    db: Session,
    *,
    user: User,
    routine: Routine,
    start_date: date,
    end_date: date,
) -> None:
    for routine_split in routine.routine_splits:
        if routine_split.day_of_week is None:
            continue

        workout_date = _first_day_on_or_after(start_date, routine_split.day_of_week)
        while workout_date <= end_date:
            week_index = max((workout_date - start_date).days // 7, 0)
            _create_completed_workout(
                db,
                user=user,
                routine=routine,
                routine_split=routine_split,
                workout_date=workout_date,
                week_index=week_index,
            )
            workout_date += timedelta(days=7)


def _create_completed_workout(
    db: Session,
    *,
    user: User,
    routine: Routine,
    routine_split: RoutineSplit,
    workout_date: date,
    week_index: int,
) -> None:
    start_time = _at_time(workout_date, hour=18)
    workout_minutes = _workout_duration_minutes(routine=routine, week_index=week_index, split_order=routine_split.split_order)
    workout_session = WorkoutSession(
        user_id=user.user_id,
        routine_id=routine.routine_id,
        split_id=routine_split.split_id,
        start_time=start_time,
        end_time=start_time + timedelta(minutes=workout_minutes),
        status=WorkoutStatus.COMPLETED,
        notes="Seeded completed workout.",
    )
    db.add(workout_session)
    db.flush()

    split_exercises = sorted(routine_split.split.split_exercises, key=lambda item: item.exercise_order)
    for split_exercise in split_exercises:
        session_exercise = SessionExercise(
            workout_session_id=workout_session.workout_session_id,
            exercise_id=split_exercise.exercise_id,
            source_split_exercise_id=split_exercise.split_exercise_id,
            exercise_order=split_exercise.exercise_order,
            status=SessionExerciseStatus.COMPLETED,
            notes=None,
        )
        db.add(session_exercise)
        db.flush()
        _seed_sets(
            db,
            session_exercise=session_exercise,
            split_exercise=split_exercise,
            week_index=week_index,
            split_order=routine_split.split_order,
        )


def _seed_sets(
    db: Session,
    *,
    session_exercise: SessionExercise,
    split_exercise: SplitExercise,
    week_index: int,
    split_order: int,
) -> None:
    set_count = _varied_set_count(
        split_exercise.default_sets or 1,
        week_index=week_index,
        exercise_order=split_exercise.exercise_order,
        split_order=split_order,
    )
    for set_number in range(1, set_count + 1):
        reps = _varied_reps(
            split_exercise.default_reps,
            week_index=week_index,
            set_number=set_number,
            exercise_order=split_exercise.exercise_order,
        )
        weight = _varied_weight(
            split_exercise.default_weight_value,
            week_index=week_index,
            set_number=set_number,
            exercise_order=split_exercise.exercise_order,
        )
        duration_seconds, distance = _varied_cardio_values(
            split_exercise.default_duration_seconds,
            split_exercise.default_distance,
            week_index=week_index,
            set_number=set_number,
            exercise_order=split_exercise.exercise_order,
        )
        db.add(
            ExerciseSet(
                session_exercise_id=session_exercise.session_exercise_id,
                set_number=set_number,
                reps=reps,
                weight=weight,
                duration_seconds=duration_seconds,
                distance=distance,
                intensity="moderate" if split_exercise.default_duration_seconds else None,
                notes=None,
            )
        )


def _workout_duration_minutes(*, routine: Routine, week_index: int, split_order: int) -> int:
    if routine.routine_type == RoutineType.WEIGHT_TRAINING:
        return 52 + min(week_index, 10) + ((week_index + split_order) % 5)
    if routine.routine_type == RoutineType.CARDIO:
        return 30 + min(week_index * 2, 18) + ((week_index + split_order) % 4)
    return 34 + ((week_index + split_order) % 6)


def _varied_set_count(
    base_sets: int,
    *,
    week_index: int,
    exercise_order: int,
    split_order: int,
) -> int:
    if base_sets <= 1:
        return base_sets

    if (week_index + exercise_order + split_order) % 6 == 0:
        return max(base_sets - 1, 1)
    if week_index >= 5 and (week_index + exercise_order) % 5 == 0:
        return base_sets + 1
    return base_sets


def _varied_reps(
    base_reps: int | None,
    *,
    week_index: int,
    set_number: int,
    exercise_order: int,
) -> int | None:
    if base_reps is None:
        return None

    trend = week_index // 4
    weekly_noise = ((week_index + exercise_order) % 3) - 1
    fatigue = -1 if set_number >= 3 and (week_index + set_number + exercise_order) % 4 == 0 else 0
    occasional_down_week = -2 if week_index > 0 and week_index % 7 == exercise_order % 4 else 0
    return max(base_reps + trend + weekly_noise + fatigue + occasional_down_week, 1)


def _varied_weight(
    base_weight: float | None,
    *,
    week_index: int,
    set_number: int,
    exercise_order: int,
) -> float | None:
    if base_weight is None:
        return None

    if week_index > 0 and week_index % 6 == exercise_order % 5:
        multiplier = 0.97
    else:
        multiplier = 1 + (week_index * 0.012)

    set_adjustment = 1 - max(set_number - 1, 0) * 0.01
    exercise_noise = (((week_index + exercise_order + set_number) % 3) - 1) * 2.5
    varied_weight = (base_weight * multiplier * set_adjustment) + exercise_noise
    return round(max(varied_weight, 0), 1)


def _varied_cardio_values(
    base_duration_seconds: int | None,
    base_distance: float | None,
    *,
    week_index: int,
    set_number: int,
    exercise_order: int,
) -> tuple[int | None, float | None]:
    if base_duration_seconds is None and base_distance is None:
        return None, None

    down_week = week_index > 0 and week_index % 5 == exercise_order % 3
    duration_multiplier = 0.94 if down_week else 1 + min(week_index * 0.025, 0.28)
    duration_noise = (((week_index + exercise_order + set_number) % 5) - 2) * 18
    duration_seconds = (
        max(int((base_duration_seconds or 0) * duration_multiplier + duration_noise), 60)
        if base_duration_seconds is not None
        else None
    )

    if base_distance is None:
        return duration_seconds, None

    distance_multiplier = 0.96 if down_week else 1 + min(week_index * 0.03, 0.34)
    pace_noise = (((week_index + exercise_order) % 4) - 1.5) * 0.03
    distance = round(max((base_distance * distance_multiplier) + pace_noise, 0.05), 2)
    return duration_seconds, distance


def _get_or_create_exercise(db: Session, exercise_plan: ExercisePlan) -> Exercise:
    query = db.query(Exercise).filter(Exercise.name == exercise_plan.name)
    if exercise_plan.equipment is not None:
        query = query.filter(Exercise.equipment == exercise_plan.equipment)

    exercise = query.filter(Exercise.is_global.is_(True)).first()
    if exercise is not None:
        return exercise

    fallback_query = db.query(Exercise).filter(Exercise.name.ilike(f"%{exercise_plan.name}%"))
    if exercise_plan.equipment is not None:
        fallback_query = fallback_query.filter(Exercise.equipment == exercise_plan.equipment)
    exercise = fallback_query.filter(Exercise.is_global.is_(True)).first()
    if exercise is not None:
        return exercise

    exercise = Exercise(
        name=exercise_plan.name,
        equipment=exercise_plan.equipment,
        exercise_type=ExerciseType.CARDIO if exercise_plan.duration_seconds else ExerciseType.WEIGHT,
        created_by_user_id=None,
        is_global=True,
    )
    db.add(exercise)
    db.flush()
    return exercise


def _first_day_on_or_after(start_date: date, day_of_week: str) -> date:
    day_index = DAY_INDEX[day_of_week]
    return start_date + timedelta(days=(day_index - start_date.weekday()) % 7)


def _at_time(day: date, *, hour: int) -> datetime:
    return datetime.combine(day, time(hour=hour), tzinfo=UTC)
