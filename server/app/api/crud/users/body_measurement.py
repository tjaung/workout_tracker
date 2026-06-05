from app.api.crud.base import CRUDBase
from models.users import BodyMeasurement
from schemas.users import BodyMeasurementCreate, BodyMeasurementUpdate


body_measurement_crud = CRUDBase[BodyMeasurement, BodyMeasurementCreate, BodyMeasurementUpdate](
    BodyMeasurement,
    "Body measurement",
)
