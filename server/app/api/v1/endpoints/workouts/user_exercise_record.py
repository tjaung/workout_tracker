from app.api.crud.workouts import user_exercise_record_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.workouts import (
    UserExerciseRecord,
    UserExerciseRecordCreate,
    UserExerciseRecordUpdate,
)


router = create_crud_router(
    prefix="/user-exercise-records",
    tags=["user-exercise-records"],
    crud=user_exercise_record_crud,
    read_schema=UserExerciseRecord,
    create_schema=UserExerciseRecordCreate,
    update_schema=UserExerciseRecordUpdate,
    pk_params={"record_id": int},
)
