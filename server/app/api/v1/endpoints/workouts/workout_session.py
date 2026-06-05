from app.api.crud.workouts import workout_session_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.workouts import WorkoutSession, WorkoutSessionCreate, WorkoutSessionUpdate


router = create_crud_router(
    prefix="/workout-sessions",
    tags=["workout-sessions"],
    crud=workout_session_crud,
    read_schema=WorkoutSession,
    create_schema=WorkoutSessionCreate,
    update_schema=WorkoutSessionUpdate,
    pk_params={"workout_session_id": int},
)
