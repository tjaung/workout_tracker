from app.api.crud.base import CRUDBase
from models.exercises import ExerciseMuscleGroup
from schemas.exercises import ExerciseMuscleGroupCreate, ExerciseMuscleGroupUpdate


exercise_muscle_group_crud = CRUDBase[
    ExerciseMuscleGroup,
    ExerciseMuscleGroupCreate,
    ExerciseMuscleGroupUpdate,
](ExerciseMuscleGroup, "Exercise muscle group")
