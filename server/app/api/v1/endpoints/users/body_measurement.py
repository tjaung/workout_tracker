from app.api.crud.users import body_measurement_crud
from app.api.v1.endpoints.base import create_crud_router
from schemas.users import BodyMeasurement, BodyMeasurementCreate, BodyMeasurementUpdate


router = create_crud_router(
    prefix="/body-measurements",
    tags=["body-measurements"],
    crud=body_measurement_crud,
    read_schema=BodyMeasurement,
    create_schema=BodyMeasurementCreate,
    update_schema=BodyMeasurementUpdate,
    pk_params={"measurement_id": int},
)
