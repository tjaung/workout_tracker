from typing import Any, Generic, TypeVar

from pydantic import BaseModel
from sqlalchemy.orm import Session

from exceptions.errors import NotFoundError


ModelT = TypeVar("ModelT")
CreateSchemaT = TypeVar("CreateSchemaT", bound=BaseModel)
UpdateSchemaT = TypeVar("UpdateSchemaT", bound=BaseModel)


class CRUDBase(Generic[ModelT, CreateSchemaT, UpdateSchemaT]):
    def __init__(self, model: type[ModelT], entity_name: str):
        self.model = model
        self.entity_name = entity_name

    def list(self, db: Session, *, skip: int = 0, limit: int = 100) -> list[ModelT]:
        return db.query(self.model).offset(skip).limit(limit).all()

    def get(self, db: Session, **filters: Any) -> ModelT | None:
        query = db.query(self.model)
        for field_name, value in filters.items():
            query = query.filter(getattr(self.model, field_name) == value)
        return query.first()

    def get_or_404(self, db: Session, **filters: Any) -> ModelT:
        item = self.get(db, **filters)
        if item is None:
            raise NotFoundError(
                f"{self.entity_name} not found",
                details={"filters": filters},
            )
        return item

    def create(self, db: Session, payload: CreateSchemaT) -> ModelT:
        item = self.model(**payload.model_dump(exclude_unset=True))
        db.add(item)
        db.flush()
        db.refresh(item)
        return item

    def update(self, db: Session, item: ModelT, payload: UpdateSchemaT) -> ModelT:
        for field_name, value in payload.model_dump(exclude_unset=True).items():
            setattr(item, field_name, value)
        db.add(item)
        db.flush()
        db.refresh(item)
        return item

    def delete(self, db: Session, item: ModelT) -> None:
        db.delete(item)
        db.flush()
