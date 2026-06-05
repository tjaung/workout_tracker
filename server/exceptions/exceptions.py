from __future__ import annotations

import logging
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from psycopg.errors import ForeignKeyViolation, UniqueViolation
from sqlalchemy.exc import IntegrityError
from starlette.exceptions import HTTPException as StarletteHTTPException

from exceptions.errors import AppError


logger = logging.getLogger(__name__)


def build_error_response(
    *,
    status_code: int,
    code: str,
    message: str,
    details: Any = None,
    request_id: str | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "details": details,
                "request_id": request_id,
            }
        },
    )


def get_request_id(request: Request) -> str | None:
    request_id = getattr(request.state, "request_id", None)
    return request_id if isinstance(request_id, str) else None


async def app_error_handler(request: Request, exc: Exception) -> JSONResponse:
    if not isinstance(exc, AppError):
        return await unhandled_exception_handler(request, exc)

    logger.warning(
        "Application error",
        extra={
            "error_code": exc.code,
            "status_code": exc.status_code,
            "details": exc.details,
            "request_id": get_request_id(request),
        },
    )
    return build_error_response(
        status_code=exc.status_code,
        code=exc.code,
        message=exc.message,
        details=exc.details,
        request_id=get_request_id(request),
    )


async def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, HTTPException):
        status_code = exc.status_code
        detail = exc.detail
    elif isinstance(exc, StarletteHTTPException):
        status_code = exc.status_code
        detail = exc.detail
    else:
        return await unhandled_exception_handler(request, exc)

    return build_error_response(
        status_code=status_code,
        code="HTTP_ERROR",
        message=str(detail),
        details=None,
        request_id=get_request_id(request),
    )


async def validation_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    if not isinstance(exc, RequestValidationError):
        return await unhandled_exception_handler(request, exc)

    return build_error_response(
        status_code=422,
        code="REQUEST_VALIDATION_ERROR",
        message="Request validation failed",
        details=exc.errors(),
        request_id=get_request_id(request),
    )


async def integrity_error_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = get_request_id(request)

    if isinstance(exc, IntegrityError) and isinstance(exc.orig, UniqueViolation):
        detail = str(exc.orig).split("\n")[0]
        return build_error_response(
            status_code=409,
            code="UNIQUE_CONSTRAINT_VIOLATION",
            message="A record with this value already exists",
            details={"database_detail": detail},
            request_id=request_id,
        )

    if isinstance(exc, IntegrityError) and isinstance(exc.orig, ForeignKeyViolation):
        detail = str(exc.orig).split("\n")[0]
        return build_error_response(
            status_code=409,
            code="FOREIGN_KEY_VIOLATION",
            message="The requested operation conflicts with an existing dependency",
            details={"database_detail": detail},
            request_id=request_id,
        )

    if isinstance(exc, IntegrityError):
        logger.exception("Database integrity error", extra={"request_id": request_id})
        return build_error_response(
            status_code=500,
            code="DATABASE_INTEGRITY_ERROR",
            message="An error occurred while processing your request",
            details={"database_detail": str(exc)},
            request_id=request_id,
        )

    return await unhandled_exception_handler(request, exc)


async def unhandled_exception_handler(
    request: Request, exc: Exception
) -> JSONResponse:
    logger.exception("Unhandled exception", extra={"request_id": get_request_id(request)})
    return build_error_response(
        status_code=500,
        code="INTERNAL_SERVER_ERROR",
        message="An unexpected error occurred",
        details=None,
        request_id=get_request_id(request),
    )


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(HTTPException, http_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(IntegrityError, integrity_error_handler)
    app.add_exception_handler(Exception, unhandled_exception_handler)
