from app.api.v1.endpoints.exercises.exercise import router as exercise_router
from app.api.v1.endpoints.exercises.exercise_muscle_group import (
    router as exercise_muscle_group_router,
)
from app.api.v1.endpoints.exercises.muscle_group import router as muscle_group_router
from app.api.v1.endpoints.exercises.record_type import router as record_type_router

__all__ = [
    "exercise_muscle_group_router",
    "exercise_router",
    "muscle_group_router",
    "record_type_router",
]
