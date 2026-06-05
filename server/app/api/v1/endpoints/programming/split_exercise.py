from app.api.crud.programming import split_exercise_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.programming import SplitExercise, SplitExerciseCreate, SplitExerciseUpdate


router = create_crud_router(
    prefix="/split-exercises",
    tags=["split-exercises"],
    crud=split_exercise_crud,
    read_schema=SplitExercise,
    create_schema=SplitExerciseCreate,
    update_schema=SplitExerciseUpdate,
    pk_params={"split_exercise_id": int},
)
