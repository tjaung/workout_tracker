from app.api.crud.base import CRUDBase
from models.exercises import RecordType
from schemas.exercises import RecordTypeCreate, RecordTypeUpdate


record_type_crud = CRUDBase[RecordType, RecordTypeCreate, RecordTypeUpdate](
    RecordType,
    "Record type",
)
