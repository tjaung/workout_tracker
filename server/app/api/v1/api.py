from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.exercises import (
    exercise_muscle_group_router,
    exercise_router,
    muscle_group_router,
    record_type_router,
)
from app.api.v1.endpoints.pentest import router as pentest_router
from app.api.v1.endpoints.programming import (
    routine_router,
    routine_split_router,
    split_exercise_router,
    split_router,
)
from app.api.v1.endpoints.progress import router as progress_router
from app.api.v1.endpoints.records import router as records_router
from app.api.v1.endpoints.users import body_measurement_router, user_router, user_settings_router
from app.api.v1.endpoints.workouts import (
    exercise_set_router,
    session_exercise_router,
    user_exercise_record_router,
    workout_session_router,
)


api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(user_settings_router)
api_router.include_router(user_router)
api_router.include_router(body_measurement_router)
api_router.include_router(exercise_router)
api_router.include_router(muscle_group_router)
api_router.include_router(exercise_muscle_group_router)
api_router.include_router(record_type_router)
api_router.include_router(routine_router)
api_router.include_router(split_router)
api_router.include_router(routine_split_router)
api_router.include_router(split_exercise_router)
api_router.include_router(progress_router)
api_router.include_router(records_router)
api_router.include_router(pentest_router)
api_router.include_router(workout_session_router)
api_router.include_router(session_exercise_router)
api_router.include_router(exercise_set_router)
api_router.include_router(user_exercise_record_router)
