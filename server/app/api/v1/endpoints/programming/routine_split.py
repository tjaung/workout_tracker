from app.api.crud.programming import routine_split_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.programming import RoutineSplit, RoutineSplitCreate, RoutineSplitUpdate


router = create_crud_router(
    prefix="/routine-splits",
    tags=["routine-splits"],
    crud=routine_split_crud,
    read_schema=RoutineSplit,
    create_schema=RoutineSplitCreate,
    update_schema=RoutineSplitUpdate,
    pk_params={"routine_id": int, "split_id": int},
)
