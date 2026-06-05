from app.api.crud.workouts import session_exercise_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.workouts import SessionExercise, SessionExerciseCreate, SessionExerciseUpdate


router = create_crud_router(
    prefix="/session-exercises",
    tags=["session-exercises"],
    crud=session_exercise_crud,
    read_schema=SessionExercise,
    create_schema=SessionExerciseCreate,
    update_schema=SessionExerciseUpdate,
    pk_params={"session_exercise_id": int},
)
