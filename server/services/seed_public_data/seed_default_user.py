from datetime import date

from sqlalchemy.orm import Session

from core.auth import hash_password
from core.database import SessionLocal
from core.logger import logger
from models.users import User


DEFAULT_USER_EMAIL = "test@test.com"
DEFAULT_USER_USERNAME = "test"
DEFAULT_USER_PASSWORD = "test"


def seed_default_user() -> User:
    db = SessionLocal()
    try:
        user = _seed_default_user(db)
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        logger.exception("Default user seed failed")
        raise
    finally:
        db.close()

    logger.info("Default user ensured: %s", DEFAULT_USER_USERNAME)
    return user


def _seed_default_user(db: Session) -> User:
    user = (
        db.query(User)
        .filter((User.username == DEFAULT_USER_USERNAME) | (User.email == DEFAULT_USER_EMAIL))
        .first()
    )

    if user is None:
        user = User(
            first_name="test",
            last_name="test",
            email=DEFAULT_USER_EMAIL,
            username=DEFAULT_USER_USERNAME,
            password_hash=hash_password(DEFAULT_USER_PASSWORD),
            sex="male",
            date_of_birth=date(1990, 1, 1),
        )
        db.add(user)
        db.flush()
        return user

    user.first_name = "test"
    user.last_name = "test"
    user.email = DEFAULT_USER_EMAIL
    user.username = DEFAULT_USER_USERNAME
    user.password_hash = hash_password(DEFAULT_USER_PASSWORD)
    user.sex = "male"
    user.date_of_birth = date(1990, 1, 1)
    db.add(user)
    db.flush()
    return user
