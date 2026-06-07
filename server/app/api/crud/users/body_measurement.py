from app.api.crud.base import CRUDBase
from models.users import BodyMeasurement
from schemas.users import BodyMeasurementCreate, BodyMeasurementUpdate, CurrentBodyMeasurementCreate
from sqlalchemy.orm import Session


body_measurement_crud = CRUDBase[BodyMeasurement, BodyMeasurementCreate, BodyMeasurementUpdate](
    BodyMeasurement,
    "Body measurement",
)


def create_current_body_measurement(
    db: Session,
    *,
    payload: CurrentBodyMeasurementCreate,
    user_id: int,
) -> BodyMeasurement:
    (
        db.query(BodyMeasurement)
        .filter(BodyMeasurement.user_id == user_id)
        .filter(BodyMeasurement.is_current.is_(True))
        .update({BodyMeasurement.is_current: False}, synchronize_session=False)
    )

    item = BodyMeasurement(
        **payload.model_dump(exclude={"is_current"}, exclude_unset=True),
        user_id=user_id,
        is_current=True,
    )
    db.add(item)
    db.flush()
    db.refresh(item)
    return item


def list_user_body_measurements(
    db: Session,
    *,
    user_id: int,
    skip: int = 0,
    limit: int = 100,
) -> list[BodyMeasurement]:
    return (
        db.query(BodyMeasurement)
        .filter(BodyMeasurement.user_id == user_id)
        .order_by(BodyMeasurement.is_current.desc(), BodyMeasurement.measured_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
