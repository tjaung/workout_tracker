from app.api.crud.base import CRUDBase
from models.workouts import SessionExercise
from schemas.workouts import SessionExerciseCreate, SessionExerciseUpdate


session_exercise_crud = CRUDBase[SessionExercise, SessionExerciseCreate, SessionExerciseUpdate](
    SessionExercise,
    "Session exercise",
)
