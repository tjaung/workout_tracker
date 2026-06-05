import csv
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy.orm import Session

from core.database import SessionLocal
from core.logger import logger
from models.exercises import Exercise, ExerciseMuscleGroup, ExerciseType, MuscleGroup


DATA_DIR = Path(__file__).resolve().parents[2] / "data"
GYM_DATASET = DATA_DIR / "gym_exercise_dataset.csv"
STRETCH_DATASET = DATA_DIR / "stretch_exercise_dataset.csv"
MUSCLE_MODIFIERS = {
    "anterior",
    "posterior",
    "lateral",
    "medial",
    "upper",
    "middle",
    "lower",
    "sternal",
    "clavicular",
    "long head",
    "short head",
    "cervicis & capitis fibers",
}


@dataclass(frozen=True)
class SeedStats:
    exercises_created: int = 0
    exercises_updated: int = 0
    muscle_groups_created: int = 0
    muscle_links_created: int = 0


def seed_public_tables() -> SeedStats:
    db = SessionLocal()
    try:
        stats = _seed_public_tables(db)
        db.commit()
    except Exception:
        db.rollback()
        logger.exception("Public exercise seed failed")
        raise
    finally:
        db.close()

    logger.info(
        "Public exercise seed complete: %s exercises created, %s exercises updated, "
        "%s muscle groups created, %s muscle links created",
        stats.exercises_created,
        stats.exercises_updated,
        stats.muscle_groups_created,
        stats.muscle_links_created,
    )
    return stats


def _seed_public_tables(db: Session) -> SeedStats:
    stats = SeedStats()
    muscle_groups = _load_muscle_groups(db)
    exercises = _load_global_exercises(db)
    muscle_links = _load_muscle_links(db)

    for path, source_type in (
        (GYM_DATASET, "gym"),
        (STRETCH_DATASET, "stretch"),
    ):
        if not path.exists():
            logger.warning("Public exercise seed file not found: %s", path)
            continue

        with path.open(newline="", encoding="utf-8-sig") as file:
            for row in csv.DictReader(file):
                stats = _seed_row(db, row, source_type, muscle_groups, exercises, muscle_links, stats)

    return stats


def _seed_row(
    db: Session,
    row: dict[str, str],
    source_type: str,
    muscle_groups: dict[str, MuscleGroup],
    exercises: dict[tuple[str, str], Exercise],
    muscle_links: set[tuple[int, int]],
    stats: SeedStats,
) -> SeedStats:
    name = _clean(row.get("Exercise Name"))
    if not name:
        return stats

    equipment = _clean(row.get("Equipment"))
    exercise_key = (_key(name), _key(equipment))
    exercise = exercises.get(exercise_key)
    exercise_type = _exercise_type(source_type, equipment)

    if exercise is None:
        exercise = Exercise(
            name=_truncate(name, 120),
            equipment=_truncate(equipment, 120),
            preparation=_clean(row.get("Preparation")),
            execution=_clean(row.get("Execution")),
            exercise_type=exercise_type,
            created_by_user_id=None,
            is_global=True,
        )
        db.add(exercise)
        db.flush()
        exercises[exercise_key] = exercise
        stats = _replace(stats, exercises_created=stats.exercises_created + 1)
    else:
        updated = _update_exercise(exercise, row, equipment, exercise_type)
        if updated:
            stats = _replace(stats, exercises_updated=stats.exercises_updated + 1)

    primary_muscles = _muscles_from_row(row, ("Main_muscle", "Target_Muscles"))
    secondary_muscles = _muscles_from_row(row, ("Synergist_Muscles", "Secondary Muscles"))

    for muscle_name in primary_muscles:
        muscle_group, stats = _get_or_create_muscle_group(db, muscle_name, muscle_groups, stats)
        stats = _link_muscle_group(db, exercise, muscle_group, True, muscle_links, stats)

    for muscle_name in secondary_muscles:
        if muscle_name in primary_muscles:
            continue
        muscle_group, stats = _get_or_create_muscle_group(db, muscle_name, muscle_groups, stats)
        stats = _link_muscle_group(db, exercise, muscle_group, False, muscle_links, stats)

    return stats


def _update_exercise(exercise: Exercise, row: dict[str, str], equipment: str, exercise_type: ExerciseType) -> bool:
    changed = False
    values = {
        "equipment": _truncate(equipment, 120),
        "preparation": _clean(row.get("Preparation")),
        "execution": _clean(row.get("Execution")),
        "exercise_type": exercise_type,
        "is_global": True,
        "created_by_user_id": None,
    }
    for field_name, value in values.items():
        if getattr(exercise, field_name) != value:
            setattr(exercise, field_name, value)
            changed = True
    return changed


def _get_or_create_muscle_group(
    db: Session,
    name: str,
    muscle_groups: dict[str, MuscleGroup],
    stats: SeedStats,
) -> tuple[MuscleGroup, SeedStats]:
    key = _key(name)
    muscle_group = muscle_groups.get(key)
    if muscle_group is not None:
        return muscle_group, stats

    muscle_group = MuscleGroup(name=_truncate(name, 80))
    db.add(muscle_group)
    db.flush()
    muscle_groups[key] = muscle_group
    return muscle_group, _replace(stats, muscle_groups_created=stats.muscle_groups_created + 1)


def _link_muscle_group(
    db: Session,
    exercise: Exercise,
    muscle_group: MuscleGroup,
    is_primary: bool,
    muscle_links: set[tuple[int, int]],
    stats: SeedStats,
) -> SeedStats:
    link_key = (exercise.exercise_id, muscle_group.muscle_group_id)
    link = db.get(
        ExerciseMuscleGroup,
        {
            "exercise_id": exercise.exercise_id,
            "muscle_group_id": muscle_group.muscle_group_id,
        },
    )
    if link is None:
        if link_key in muscle_links:
            return stats

        db.add(
            ExerciseMuscleGroup(
                exercise_id=exercise.exercise_id,
                muscle_group_id=muscle_group.muscle_group_id,
                is_primary=is_primary,
            )
        )
        muscle_links.add(link_key)
        return _replace(stats, muscle_links_created=stats.muscle_links_created + 1)

    if is_primary and not link.is_primary:
        link.is_primary = True
    return stats


def _load_muscle_groups(db: Session) -> dict[str, MuscleGroup]:
    return {_key(muscle_group.name): muscle_group for muscle_group in db.query(MuscleGroup).all()}


def _load_global_exercises(db: Session) -> dict[tuple[str, str], Exercise]:
    return {
        (_key(exercise.name), _key(exercise.equipment)): exercise
        for exercise in db.query(Exercise).filter(Exercise.is_global.is_(True)).all()
    }


def _load_muscle_links(db: Session) -> set[tuple[int, int]]:
    return {
        (link.exercise_id, link.muscle_group_id)
        for link in db.query(ExerciseMuscleGroup.exercise_id, ExerciseMuscleGroup.muscle_group_id).all()
    }


def _exercise_type(source_type: str, equipment: str) -> ExerciseType:
    if source_type == "stretch" or "stretch" in equipment.lower():
        return ExerciseType.MOBILITY
    if equipment.lower() in {"body weight", "assisted", "assisted (partner)", "assisted (machine)"}:
        return ExerciseType.BODYWEIGHT
    return ExerciseType.WEIGHT


def _muscles_from_row(row: dict[str, str], columns: tuple[str, ...]) -> set[str]:
    muscles: set[str] = set()
    for column in columns:
        muscles.update(_parse_muscles(row.get(column)))
    return muscles


def _parse_muscles(value: str | None) -> set[str]:
    if not value:
        return set()

    muscles: list[str] = []
    for part in value.split(","):
        token = _clean(part)
        if not token or token.lower() == "none":
            continue

        if muscles and token.lower() in MUSCLE_MODIFIERS:
            muscles[-1] = f"{muscles[-1]} {token}"
        else:
            muscles.append(token)

    return {_truncate(muscle, 80) for muscle in muscles}


def _clean(value: str | None) -> str:
    return " ".join((value or "").replace("\u200b", "").split())


def _key(value: str | None) -> str:
    return _clean(value).casefold()


def _truncate(value: str, max_length: int) -> str:
    return value[:max_length]


def _replace(stats: SeedStats, **changes: int) -> SeedStats:
    values = {
        "exercises_created": stats.exercises_created,
        "exercises_updated": stats.exercises_updated,
        "muscle_groups_created": stats.muscle_groups_created,
        "muscle_links_created": stats.muscle_links_created,
    }
    values.update(changes)
    return SeedStats(**values)
