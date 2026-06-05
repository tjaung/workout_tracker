from dataclasses import dataclass, field

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


@dataclass(frozen=True)
class ExerciseRef:
    name: str
    equipment: str | None = None
    exercise_type: ExerciseType | None = None


@dataclass(frozen=True)
class SampleExercise:
    ref: ExerciseRef
    sets: int | None = None
    reps: int | None = None
    weight_value: float | None = None
    weight_unit: WeightUnit | None = None
    duration_seconds: int | None = None
    distance: float | None = None
    notes: str | None = None


@dataclass(frozen=True)
class SampleSplit:
    name: str
    exercises: list[SampleExercise]
    day_of_week: str | None = None


@dataclass(frozen=True)
class SampleRoutine:
    name: str
    description: str
    routine_type: RoutineType
    goal: RoutineGoal
    intensity: RoutineIntensity
    splits: list[SampleSplit]


@dataclass(frozen=True)
class RoutineSeedStats:
    routines_created: int = 0
    exercises_created: int = 0
    skipped_routines: int = 0


CARDIO_EXERCISES = [
    (
        "Brisk Walk",
        "Body Weight",
        "Walk at a pace that raises breathing while staying conversational.",
        "Walk briskly with tall posture and relaxed shoulders.",
    ),
    (
        "Walk / Jog Intervals",
        "Body Weight",
        "Alternate easy walking with short jogging efforts.",
        "Keep jog intervals controlled and recover fully during walks.",
    ),
    (
        "Easy Run",
        "Body Weight",
        "Run at a comfortable, sustainable pace.",
        "Maintain relaxed breathing and stop before form breaks down.",
    ),
]


SAMPLE_ROUTINES = [
    SampleRoutine(
        name="Upper Lower Strength Split",
        description=(
            "A classic four-day upper/lower split built around compound lifts. "
            "Good for general strength and muscle growth with repeatable weekly structure."
        ),
        routine_type=RoutineType.WEIGHT_TRAINING,
        goal=RoutineGoal.STRENGTH,
        intensity=RoutineIntensity.MODERATE,
        splits=[
            SampleSplit(
                name="Upper A",
                day_of_week="MONDAY",
                exercises=[
                    SampleExercise(ExerciseRef("Bench Press", "Barbell"), sets=4, reps=6, weight_value=75, weight_unit=WeightUnit.PERCENT_1RM),
                    SampleExercise(ExerciseRef("Pulldown", "Cable"), sets=4, reps=8),
                    SampleExercise(ExerciseRef("Shoulder Press", "Dumbbell"), sets=3, reps=10),
                    SampleExercise(ExerciseRef("Curl", "Dumbbell"), sets=3, reps=12),
                    SampleExercise(ExerciseRef("Triceps Extension", "Cable"), sets=3, reps=12),
                ],
            ),
            SampleSplit(
                name="Lower A",
                day_of_week="TUESDAY",
                exercises=[
                    SampleExercise(ExerciseRef("Squat", "Barbell"), sets=4, reps=6, weight_value=75, weight_unit=WeightUnit.PERCENT_1RM),
                    SampleExercise(ExerciseRef("Straight-leg Deadlift", "Barbell"), sets=3, reps=8),
                    SampleExercise(ExerciseRef("Lunge", "Dumbbell"), sets=3, reps=10),
                    SampleExercise(ExerciseRef("Standing Calf Raise", "Dumbbell"), sets=3, reps=15),
                ],
            ),
            SampleSplit(
                name="Upper B",
                day_of_week="THURSDAY",
                exercises=[
                    SampleExercise(ExerciseRef("Push-up", "Body Weight"), sets=4, reps=12),
                    SampleExercise(ExerciseRef("Pull-up", "Body Weight"), sets=4, reps=6),
                    SampleExercise(ExerciseRef("Shoulder Press", "Cable"), sets=3, reps=10),
                    SampleExercise(ExerciseRef("Bench Dip", "Body Weight"), sets=3, reps=12),
                    SampleExercise(ExerciseRef("Curl", "Barbell"), sets=3, reps=10),
                ],
            ),
            SampleSplit(
                name="Lower B",
                day_of_week="FRIDAY",
                exercises=[
                    SampleExercise(ExerciseRef("Deadlifts", "Barbell"), sets=3, reps=5, weight_value=75, weight_unit=WeightUnit.PERCENT_1RM),
                    SampleExercise(ExerciseRef("Leg Presses", "Sled"), sets=3, reps=10),
                    SampleExercise(ExerciseRef("Step-up", "Body Weight"), sets=3, reps=12),
                    SampleExercise(ExerciseRef("Squat", "Body Weight"), sets=3, reps=15),
                ],
            ),
        ],
    ),
    SampleRoutine(
        name="Couch to 5K Base",
        description=(
            "A simple walk-run progression inspired by popular beginner 5K plans. "
            "Use it three days per week with recovery between sessions."
        ),
        routine_type=RoutineType.CARDIO,
        goal=RoutineGoal.ENDURANCE,
        intensity=RoutineIntensity.LOW,
        splits=[
            SampleSplit(
                name="Walk Run Intervals A",
                day_of_week="MONDAY",
                exercises=[
                    SampleExercise(ExerciseRef("Brisk Walk", "Body Weight"), duration_seconds=300, notes="Warm up."),
                    SampleExercise(ExerciseRef("Walk / Jog Intervals", "Body Weight"), duration_seconds=1200, notes="Alternate 60s jog with 90s walk."),
                    SampleExercise(ExerciseRef("Brisk Walk", "Body Weight"), duration_seconds=300, notes="Cool down."),
                ],
            ),
            SampleSplit(
                name="Walk Run Intervals B",
                day_of_week="WEDNESDAY",
                exercises=[
                    SampleExercise(ExerciseRef("Brisk Walk", "Body Weight"), duration_seconds=300, notes="Warm up."),
                    SampleExercise(ExerciseRef("Walk / Jog Intervals", "Body Weight"), duration_seconds=1500, notes="Alternate 90s jog with 2min walk."),
                    SampleExercise(ExerciseRef("Brisk Walk", "Body Weight"), duration_seconds=300, notes="Cool down."),
                ],
            ),
            SampleSplit(
                name="Easy Endurance Day",
                day_of_week="SATURDAY",
                exercises=[
                    SampleExercise(ExerciseRef("Easy Run", "Body Weight"), duration_seconds=1200, distance=1.5, notes="Keep this conversational."),
                    SampleExercise(ExerciseRef("Brisk Walk", "Body Weight"), duration_seconds=300, notes="Cool down."),
                ],
            ),
        ],
    ),
    SampleRoutine(
        name="Daily Mobility Flow",
        description=(
            "A short daily mobility routine inspired by common flexibility flows. "
            "Targets hips, hamstrings, back, and shoulders without needing equipment."
        ),
        routine_type=RoutineType.MOBILITY,
        goal=RoutineGoal.FLEXIBILITY,
        intensity=RoutineIntensity.LOW,
        splits=[
            SampleSplit(
                name="Full Body Mobility",
                day_of_week="MONDAY",
                exercises=[
                    SampleExercise(ExerciseRef("Doorway", "Stretch"), duration_seconds=60, notes="Gentle chest and shoulder opener."),
                    SampleExercise(ExerciseRef("Standing Side Reach", "Stretch"), duration_seconds=60),
                    SampleExercise(ExerciseRef("Lying Piriformis Stretch (single leg)", "Stretch (Piriformis)"), duration_seconds=90),
                    SampleExercise(ExerciseRef("Kneeling", "Stretch (Iliopsoas)"), duration_seconds=90),
                    SampleExercise(ExerciseRef("Seated:  Single Leg", "Stretch"), duration_seconds=90),
                ],
            ),
            SampleSplit(
                name="Hips and Hamstrings",
                day_of_week="THURSDAY",
                exercises=[
                    SampleExercise(ExerciseRef("Seated Groin", "Stretch"), duration_seconds=90),
                    SampleExercise(ExerciseRef("Lying Crossover", "Stretch (Gluteus Medius & Minimus)"), duration_seconds=90),
                    SampleExercise(ExerciseRef("Standing", "Stretch (Iliopsoas)"), duration_seconds=90),
                    SampleExercise(ExerciseRef("Soldier Kick", "Dynamic Stretch"), duration_seconds=60),
                ],
            ),
        ],
    ),
]


def seed_public_routines() -> RoutineSeedStats:
    db = SessionLocal()
    try:
        stats = _seed_public_routines(db)
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Public routine seed failed")
        raise
    finally:
        db.close()

    logger.info(
        "Public routine seed complete: %s routines created, %s exercises created, %s routines skipped",
        stats.routines_created,
        stats.exercises_created,
        stats.skipped_routines,
    )
    return stats


def _seed_public_routines(db: Session) -> RoutineSeedStats:
    stats = RoutineSeedStats()
    for name, equipment, preparation, execution in CARDIO_EXERCISES:
        _, created = _get_or_create_exercise(
            db,
            ExerciseRef(name=name, equipment=equipment, exercise_type=ExerciseType.CARDIO),
            preparation=preparation,
            execution=execution,
        )
        if created:
            stats = _replace_stats(stats, exercises_created=stats.exercises_created + 1)

    for sample_routine in SAMPLE_ROUTINES:
        existing = (
            db.query(Routine)
            .filter(Routine.routine_name == sample_routine.name)
            .filter(Routine.is_global.is_(True))
            .first()
        )
        if existing is not None:
            stats = _replace_stats(stats, skipped_routines=stats.skipped_routines + 1)
            continue

        _create_sample_routine(db, sample_routine)
        stats = _replace_stats(stats, routines_created=stats.routines_created + 1)

    return stats


def _create_sample_routine(db: Session, sample_routine: SampleRoutine) -> Routine:
    routine = Routine(
        created_by_user_id=None,
        routine_name=sample_routine.name,
        description=sample_routine.description,
        routine_type=sample_routine.routine_type,
        goal=sample_routine.goal,
        intensity=sample_routine.intensity,
        is_global=True,
        is_active=False,
    )
    db.add(routine)
    db.flush()

    for split_index, sample_split in enumerate(sample_routine.splits, start=1):
        split = Split(
            created_by_user_id=None,
            split_name=sample_split.name,
            is_global=True,
        )
        db.add(split)
        db.flush()
        db.add(
            RoutineSplit(
                routine_id=routine.routine_id,
                split_id=split.split_id,
                split_order=split_index,
                day_of_week=sample_split.day_of_week,
            )
        )

        for exercise_index, sample_exercise in enumerate(sample_split.exercises, start=1):
            exercise, _ = _get_or_create_exercise(db, sample_exercise.ref)
            db.add(
                SplitExercise(
                    split_id=split.split_id,
                    exercise_id=exercise.exercise_id,
                    exercise_order=exercise_index,
                    default_sets=sample_exercise.sets,
                    default_reps=sample_exercise.reps,
                    default_weight_value=sample_exercise.weight_value,
                    default_weight_unit=sample_exercise.weight_unit,
                    default_duration_seconds=sample_exercise.duration_seconds,
                    default_distance=sample_exercise.distance,
                    notes=sample_exercise.notes,
                )
            )

    return routine


def _get_or_create_exercise(
    db: Session,
    exercise_ref: ExerciseRef,
    *,
    preparation: str | None = None,
    execution: str | None = None,
) -> tuple[Exercise, bool]:
    exercise = _find_exercise(db, exercise_ref)
    if exercise is not None:
        return exercise, False

    exercise = Exercise(
        name=exercise_ref.name,
        equipment=exercise_ref.equipment,
        preparation=preparation,
        execution=execution,
        exercise_type=exercise_ref.exercise_type or ExerciseType.OTHER,
        created_by_user_id=None,
        is_global=True,
    )
    db.add(exercise)
    db.flush()
    return exercise, True


def _find_exercise(db: Session, exercise_ref: ExerciseRef) -> Exercise | None:
    query = db.query(Exercise).filter(Exercise.name == exercise_ref.name)
    if exercise_ref.equipment is not None:
        query = query.filter(Exercise.equipment == exercise_ref.equipment)
    if exercise_ref.exercise_type is not None:
        query = query.filter(Exercise.exercise_type == exercise_ref.exercise_type)
    exercise = query.filter(Exercise.is_global.is_(True)).first()
    if exercise is not None:
        return exercise

    fallback_query = db.query(Exercise).filter(Exercise.name.ilike(f"%{exercise_ref.name}%"))
    if exercise_ref.equipment is not None:
        fallback_query = fallback_query.filter(Exercise.equipment == exercise_ref.equipment)
    return fallback_query.filter(Exercise.is_global.is_(True)).first()


def _replace_stats(stats: RoutineSeedStats, **changes: int) -> RoutineSeedStats:
    values = {
        "routines_created": stats.routines_created,
        "exercises_created": stats.exercises_created,
        "skipped_routines": stats.skipped_routines,
    }
    values.update(changes)
    return RoutineSeedStats(**values)
