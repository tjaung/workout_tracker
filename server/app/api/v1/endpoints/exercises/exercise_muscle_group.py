from app.api.crud.exercises import exercise_muscle_group_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.exercises import (
    ExerciseMuscleGroup,
    ExerciseMuscleGroupCreate,
    ExerciseMuscleGroupUpdate,
)


router = create_crud_router(
    prefix="/exercise-muscle-groups",
    tags=["exercise-muscle-groups"],
    crud=exercise_muscle_group_crud,
    read_schema=ExerciseMuscleGroup,
    create_schema=ExerciseMuscleGroupCreate,
    update_schema=ExerciseMuscleGroupUpdate,
    pk_params={"exercise_id": int, "muscle_group_id": int},
)
