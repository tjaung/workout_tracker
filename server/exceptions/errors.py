from __future__ import annotations

from typing import Any


class AppError(Exception):
    code = "APP_ERROR"
    status_code = 500

    def __init__(self, message: str, *, details: dict[str, Any] | None = None):
        super().__init__(message)
        self.message = message
        self.details = details or {}


class BadRequestError(AppError):
    code = "BAD_REQUEST"
    status_code = 400


class ValidationAppError(BadRequestError):
    code = "VALIDATION_ERROR"


class UnauthorizedError(AppError):
    code = "UNAUTHORIZED"
    status_code = 401


class ForbiddenError(AppError):
    code = "FORBIDDEN"
    status_code = 403


class NotFoundError(AppError):
    code = "NOT_FOUND"
    status_code = 404


class ConflictError(AppError):
    code = "CONFLICT"
    status_code = 409


class DependencyConflictError(ConflictError):
    code = "DEPENDENCY_CONFLICT"


class BusinessRuleError(BadRequestError):
    code = "BUSINESS_RULE_VIOLATION"


class InvalidStateError(BusinessRuleError):
    code = "INVALID_STATE"


class InsufficientInventoryError(BusinessRuleError):
    code = "INSUFFICIENT_INVENTORY"


class ExternalDependencyError(AppError):
    code = "EXTERNAL_DEPENDENCY_ERROR"
    status_code = 503


class ServiceConfigurationError(AppError):
    code = "SERVICE_CONFIGURATION_ERROR"
    status_code = 500


class DatabaseError(AppError):
    code = "DATABASE_ERROR"
    status_code = 500