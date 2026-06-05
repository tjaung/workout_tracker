from app.api.v1.endpoints.programming.routine import router as routine_router
from app.api.v1.endpoints.programming.routine_split import router as routine_split_router
from app.api.v1.endpoints.programming.split import router as split_router
from app.api.v1.endpoints.programming.split_exercise import router as split_exercise_router

__all__ = ["routine_router", "routine_split_router", "split_exercise_router", "split_router"]
