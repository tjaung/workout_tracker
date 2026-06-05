from fastapi import FastAPI

from app.api.v1.api import api_router
from core.config import get_settings
from core.lifespan import lifespan
from core.middleware import configure_middleware
from exceptions.exceptions import register_exception_handlers


settings = get_settings()

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
    lifespan=lifespan,
    description="API for tracking workouts, routines, exercises, and personal records.",
)

configure_middleware(app, settings)
register_exception_handlers(app)
app.include_router(api_router, prefix=f"{settings.api_prefix}/v1")


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": f"{settings.app_name} is up and running"}


@app.get(f"{settings.api_prefix}/health")
async def health_check() -> dict[str, str | bool]:
    return {
        "status": "ok",
        "environment": settings.environment,
        "database_configured": bool(settings.sqlalchemy_database_url),
    }
