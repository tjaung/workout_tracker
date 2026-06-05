from app.api.crud.users import user_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.users import User, UserCreate, UserUpdate


router = create_crud_router(
    prefix="/users",
    tags=["users"],
    crud=user_crud,
    read_schema=User,
    create_schema=UserCreate,
    update_schema=UserUpdate,
    pk_params={"user_id": int},
)
