from inspect import Parameter, Signature
from typing import Any

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.crud.base import CRUDBase
from core.database import get_db


def create_crud_router(
    *,
    prefix: str,
    tags: list[str],
    crud: CRUDBase[Any, Any, Any],
    read_schema: type[BaseModel],
    create_schema: type[BaseModel],
    update_schema: type[BaseModel],
    pk_params: dict[str, type],
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=tags)
    path = _build_path(pk_params)

    def list_items(
        skip: int = Query(default=0, ge=0),
        limit: int = Query(default=100, ge=1, le=500),
        db: Session = Depends(get_db),
    ) -> list[Any]:
        return crud.list(db, skip=skip, limit=limit)

    def create_item(payload: Any, db: Session = Depends(get_db)) -> Any:
        try:
            item = crud.create(db, payload)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise
        return item

    def get_item(**kwargs: Any) -> Any:
        db = kwargs.pop("db")
        return crud.get_or_404(db, **_filters(pk_params, kwargs))

    def update_item(**kwargs: Any) -> Any:
        db = kwargs.pop("db")
        payload = kwargs.pop("payload")
        item = crud.get_or_404(db, **_filters(pk_params, kwargs))
        try:
            item = crud.update(db, item, payload)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise
        return item

    def delete_item(**kwargs: Any) -> None:
        db = kwargs.pop("db")
        item = crud.get_or_404(db, **_filters(pk_params, kwargs))
        try:
            crud.delete(db, item)
            db.commit()
        except IntegrityError:
            db.rollback()
            raise

    create_item.__signature__ = Signature(  # type: ignore[attr-defined]
        parameters=[
            Parameter(
                "payload",
                Parameter.POSITIONAL_OR_KEYWORD,
                annotation=create_schema,
            ),
            _db_parameter(),
        ]
    )
    get_item.__signature__ = _item_signature(pk_params)  # type: ignore[attr-defined]
    update_item.__signature__ = _item_signature(pk_params, update_schema=update_schema)  # type: ignore[attr-defined]
    delete_item.__signature__ = _item_signature(pk_params)  # type: ignore[attr-defined]

    router.add_api_route("", list_items, methods=["GET"], response_model=list[read_schema])
    router.add_api_route(
        "",
        create_item,
        methods=["POST"],
        response_model=read_schema,
        status_code=status.HTTP_201_CREATED,
    )
    router.add_api_route(path, get_item, methods=["GET"], response_model=read_schema)
    router.add_api_route(path, update_item, methods=["PATCH"], response_model=read_schema)
    router.add_api_route(path, delete_item, methods=["DELETE"], status_code=status.HTTP_204_NO_CONTENT)

    return router


def _build_path(pk_params: dict[str, type]) -> str:
    return "/" + "/".join(f"{{{name}}}" for name in pk_params)


def _filters(pk_params: dict[str, type], values: dict[str, Any]) -> dict[str, Any]:
    return {field_name: values[field_name] for field_name in pk_params}


def _db_parameter() -> Parameter:
    return Parameter(
        "db",
        Parameter.POSITIONAL_OR_KEYWORD,
        default=Depends(get_db),
        annotation=Session,
    )


def _item_signature(
    pk_params: dict[str, type],
    *,
    update_schema: type[BaseModel] | None = None,
) -> Signature:
    parameters = [
        Parameter(field_name, Parameter.POSITIONAL_OR_KEYWORD, annotation=field_type)
        for field_name, field_type in pk_params.items()
    ]
    if update_schema is not None:
        parameters.append(
            Parameter(
                "payload",
                Parameter.POSITIONAL_OR_KEYWORD,
                annotation=update_schema,
            )
        )
    parameters.append(_db_parameter())
    return Signature(parameters=parameters)
