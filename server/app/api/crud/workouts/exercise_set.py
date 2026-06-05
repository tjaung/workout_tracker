from app.api.crud.base import CRUDBase
from models.workouts import ExerciseSet
from schemas.workouts import ExerciseSetCreate, ExerciseSetUpdate


exercise_set_crud = CRUDBase[ExerciseSet, ExerciseSetCreate, ExerciseSetUpdate](
    ExerciseSet,
    "Exercise set",
)
