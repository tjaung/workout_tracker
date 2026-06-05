from app.api.crud.programming import split_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.programming import Split, SplitCreate, SplitUpdate


router = create_crud_router(
    prefix="/splits",
    tags=["splits"],
    crud=split_crud,
    read_schema=Split,
    create_schema=SplitCreate,
    update_schema=SplitUpdate,
    pk_params={"split_id": int},
)
