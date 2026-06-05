from app.api.crud.exercises import muscle_group_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.exercises import MuscleGroup, MuscleGroupCreate, MuscleGroupUpdate


router = create_crud_router(
    prefix="/muscle-groups",
    tags=["muscle-groups"],
    crud=muscle_group_crud,
    read_schema=MuscleGroup,
    create_schema=MuscleGroupCreate,
    update_schema=MuscleGroupUpdate,
    pk_params={"muscle_group_id": int},
)
