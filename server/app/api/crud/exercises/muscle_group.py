from app.api.crud.base import CRUDBase
from models.exercises import MuscleGroup
from schemas.exercises import MuscleGroupCreate, MuscleGroupUpdate


muscle_group_crud = CRUDBase[MuscleGroup, MuscleGroupCreate, MuscleGroupUpdate](
    MuscleGroup,
    "Muscle group",
)
