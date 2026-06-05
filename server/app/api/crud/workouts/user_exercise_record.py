from app.api.crud.base import CRUDBase
from models.workouts import UserExerciseRecord
from schemas.workouts import UserExerciseRecordCreate, UserExerciseRecordUpdate


user_exercise_record_crud = CRUDBase[
    UserExerciseRecord,
    UserExerciseRecordCreate,
    UserExerciseRecordUpdate,
](UserExerciseRecord, "User exercise record")
