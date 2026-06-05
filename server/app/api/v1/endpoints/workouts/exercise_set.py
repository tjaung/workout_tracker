from app.api.crud.workouts import exercise_set_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.workouts import ExerciseSet, ExerciseSetCreate, ExerciseSetUpdate


router = create_crud_router(
    prefix="/exercise-sets",
    tags=["exercise-sets"],
    crud=exercise_set_crud,
    read_schema=ExerciseSet,
    create_schema=ExerciseSetCreate,
    update_schema=ExerciseSetUpdate,
    pk_params={"set_id": int},
)
