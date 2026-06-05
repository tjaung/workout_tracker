from app.api.crud.exercises import record_type_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.exercises import RecordType, RecordTypeCreate, RecordTypeUpdate


router = create_crud_router(
    prefix="/record-types",
    tags=["record-types"],
    crud=record_type_crud,
    read_schema=RecordType,
    create_schema=RecordTypeCreate,
    update_schema=RecordTypeUpdate,
    pk_params={"record_type_id": int},
)
