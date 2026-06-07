from datetime import UTC, datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session

from core.auth import hash_password, verify_password
from models.users import User
from schemas.users import UserCreate


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_user_by_username(db: Session, username: str) -> User | None:
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_username_or_email(db: Session, value: str) -> User | None:
    return db.query(User).filter(or_(User.username == value, User.email == value)).first()


def create_user(db: Session, payload: UserCreate) -> User:
    user = User(
        username=payload.username,
        email=payload.email,
        password_hash=hash_password(payload.password),
        first_name=payload.first_name,
        last_name=payload.last_name,
        sex=payload.sex,
        date_of_birth=payload.date_of_birth,
    )
    db.add(user)
    db.flush()
    db.refresh(user)
    return user


def authenticate_user(db: Session, username: str, password: str) -> User | None:
    user = get_user_by_username_or_email(db, username)
    if user is None:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def update_last_login(db: Session, user: User) -> User:
    user.last_login = datetime.now(UTC)
    db.add(user)
    db.flush()
    db.refresh(user)
    return user
