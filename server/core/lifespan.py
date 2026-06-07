from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

import models
from core.config import get_settings
from core.database import Base, engine
from core.logger import logger
from services.schema_migrations import ensure_runtime_schema
from services.seed_public_data import (
    seed_default_user,
    seed_public_routines,
    seed_public_tables,
    seed_test_user_history,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    settings = get_settings()
    logger.info("Starting %s", settings.app_name)

    if settings.ensure_tables_on_startup:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables ensured")
        ensure_runtime_schema()
        seed_default_user()
        seed_public_tables()
        seed_public_routines()
        seed_test_user_history()

    yield

    logger.info("Stopping %s", settings.app_name)
