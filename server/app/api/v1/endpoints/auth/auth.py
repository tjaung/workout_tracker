from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.crud.auth import authenticate_user, create_user, get_user_by_id, update_last_login
from core.auth import create_csrf_token, create_session_token, decode_session_token, verify_csrf_token
from core.config import Settings, get_settings
from core.database import get_db
from schemas.users import AuthResponse, LoginRequest, SessionStatus, User, UserCreate


router = APIRouter(prefix="/auth", tags=["auth"])


def set_csrf_cookie(response: Response, settings: Settings) -> str:
    csrf_token = create_csrf_token()
    response.set_cookie(
        key=settings.csrf_cookie_name,
        value=csrf_token,
        max_age=settings.csrf_cookie_max_age_seconds,
        httponly=False,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
    )
    return csrf_token


def require_csrf(request: Request, settings: Settings = Depends(get_settings)) -> None:
    csrf_cookie = request.cookies.get(settings.csrf_cookie_name)
    csrf_header = request.headers.get(settings.csrf_header_name)

    if not csrf_cookie or not csrf_header:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing CSRF token",
        )

    if csrf_cookie != csrf_header or not verify_csrf_token(csrf_header):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid CSRF token",
        )


@router.get("/csrf")
def csrf_token(
    response: Response,
    settings: Settings = Depends(get_settings),
) -> dict[str, str]:
    csrf_token = set_csrf_cookie(response, settings)
    return {
        "csrf_token": csrf_token,
        "header_name": settings.csrf_header_name,
    }


@router.post("/signup", response_model=User, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)) -> User:
    try:
        user = create_user(db, payload)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username or email already exists",
        ) from exc
    return user


@router.post("/login", response_model=AuthResponse, dependencies=[Depends(require_csrf)])
def login(
    payload: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> AuthResponse:
    user = authenticate_user(db, payload.username, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    user = update_last_login(db, user)
    db.commit()
    response.set_cookie(
        key=settings.session_cookie_name,
        value=create_session_token(user.user_id),
        max_age=settings.session_cookie_max_age_seconds,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
    )
    set_csrf_cookie(response, settings)
    return AuthResponse(user=user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_csrf)])
def logout(
    response: Response,
    settings: Settings = Depends(get_settings),
) -> None:
    response.delete_cookie(
        key=settings.session_cookie_name,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
    )
    response.delete_cookie(
        key=settings.csrf_cookie_name,
        httponly=False,
        secure=settings.session_cookie_secure,
        samesite=settings.session_cookie_samesite,
    )


@router.get("/me", response_model=SessionStatus)
def me(
    request: Request,
    db: Session = Depends(get_db),
    settings: Settings = Depends(get_settings),
) -> SessionStatus:
    session_token = request.cookies.get(settings.session_cookie_name)
    if not session_token:
        return SessionStatus(authenticated=False)

    try:
        session_data = decode_session_token(session_token)
    except ValueError:
        return SessionStatus(authenticated=False)

    user_id = session_data.get("user_id")
    if not isinstance(user_id, int):
        return SessionStatus(authenticated=False)

    user = get_user_by_id(db, user_id)
    if user is None:
        return SessionStatus(authenticated=False)

    return SessionStatus(authenticated=True, user=user)
