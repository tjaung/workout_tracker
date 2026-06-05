from app.api.crud.base import CRUDBase
from models.exercises import Exercise, ExerciseMuscleGroup
from schemas.exercises import ExerciseCreate, ExerciseUpdate
from sqlalchemy.orm import Session, joinedload


exercise_crud = CRUDBase[Exercise, ExerciseCreate, ExerciseUpdate](Exercise, "Exercise")


def list_exercises_with_details(
    db: Session,
    *,
    skip: int = 0,
    limit: int = 100,
) -> list[Exercise]:
    return (
        db.query(Exercise)
        .options(
            joinedload(Exercise.muscle_groups)
            .joinedload(ExerciseMuscleGroup.muscle_group),
        )
        .order_by(Exercise.name.asc())
        .offset(skip)
        .limit(limit)
        .all()
    )
