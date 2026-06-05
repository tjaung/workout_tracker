from app.api.crud.base import CRUDBase
from models.programming import SplitExercise
from schemas.programming import SplitExerciseCreate, SplitExerciseUpdate


split_exercise_crud = CRUDBase[SplitExercise, SplitExerciseCreate, SplitExerciseUpdate](
    SplitExercise,
    "Split exercise",
)
