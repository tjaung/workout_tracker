from app.api.crud.base import CRUDBase
from models.workouts import WorkoutSession
from schemas.workouts import WorkoutSessionCreate, WorkoutSessionUpdate


workout_session_crud = CRUDBase[WorkoutSession, WorkoutSessionCreate, WorkoutSessionUpdate](
    WorkoutSession,
    "Workout session",
)
