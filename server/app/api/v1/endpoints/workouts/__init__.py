from app.api.v1.endpoints.workouts.exercise_set import router as exercise_set_router
from app.api.v1.endpoints.workouts.session_exercise import router as session_exercise_router
from app.api.v1.endpoints.workouts.user_exercise_record import router as user_exercise_record_router
from app.api.v1.endpoints.workouts.workout_session import router as workout_session_router

__all__ = [
    "exercise_set_router",
    "session_exercise_router",
    "user_exercise_record_router",
    "workout_session_router",
]
