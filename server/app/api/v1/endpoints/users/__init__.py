from app.api.v1.endpoints.users.body_measurement import router as body_measurement_router
from app.api.v1.endpoints.users.user import router as user_router
from app.api.v1.endpoints.users.user_settings import router as user_settings_router

__all__ = ["body_measurement_router", "user_router", "user_settings_router"]
