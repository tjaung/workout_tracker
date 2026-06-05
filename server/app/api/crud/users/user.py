from sqlalchemy.orm import Session

from app.api.crud.base import CRUDBase
from core.auth import hash_password
from models.users import User
from schemas.users import UserCreate, UserUpdate


class UserCRUD(CRUDBase[User, UserCreate, UserUpdate]):
    def create(self, db: Session, payload: UserCreate) -> User:
        user = User(
            username=payload.username,
            email=payload.email,
            password_hash=hash_password(payload.password),
            first_name=payload.first_name,
            last_name=payload.last_name,
        )
        db.add(user)
        db.flush()
        db.refresh(user)
        return user

    def update(self, db: Session, item: User, payload: UserUpdate) -> User:
        data = payload.model_dump(exclude_unset=True)
        password = data.pop("password", None)
        if password:
            item.password_hash = hash_password(password)
        for field_name, value in data.items():
            setattr(item, field_name, value)
        db.add(item)
        db.flush()
        db.refresh(item)
        return item


user_crud = UserCRUD(User, "User")
