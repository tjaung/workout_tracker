from pydantic import BaseModel, Field

from schemas.users.user import User


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=255)
    password: str = Field(min_length=1, max_length=255)


class AuthResponse(BaseModel):
    user: User


class SessionStatus(BaseModel):
    authenticated: bool
    user: User | None = None
