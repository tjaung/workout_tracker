from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.crud.users import body_measurement_crud, create_current_body_measurement, list_user_body_measurements
from app.api.v1.endpoints.base import create_crud_router
from app.api.v1.endpoints.programming.routine import get_current_user
from core.database import get_db
from schemas.users import (
    BodyMeasurement,
    BodyMeasurementCreate,
    BodyMeasurementUpdate,
    CurrentBodyMeasurementCreate,
    User,
)


router = APIRouter()
body_measurement_detail_router = APIRouter(prefix="/body-measurements", tags=["body-measurements"])


@body_measurement_detail_router.get("/me", response_model=list[BodyMeasurement])
def list_my_measurements(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[BodyMeasurement]:
    return list_user_body_measurements(db, user_id=current_user.user_id, skip=skip, limit=limit)


@body_measurement_detail_router.post("/current", response_model=BodyMeasurement, status_code=status.HTTP_201_CREATED)
def create_current_measurement(
    payload: CurrentBodyMeasurementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> BodyMeasurement:
    measurement = create_current_body_measurement(db, payload=payload, user_id=current_user.user_id)
    db.commit()
    return measurement


router.include_router(body_measurement_detail_router)
router.include_router(create_crud_router(
    prefix="/body-measurements",
    tags=["body-measurements"],
    crud=body_measurement_crud,
    read_schema=BodyMeasurement,
    create_schema=BodyMeasurementCreate,
    update_schema=BodyMeasurementUpdate,
    pk_params={"measurement_id": int},
))
