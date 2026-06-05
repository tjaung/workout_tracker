from sqlalchemy import inspect, text

from core.database import engine
from core.logger import logger


ROUTINE_METADATA_COLUMNS = {
    "description": "TEXT",
    "routine_type": "VARCHAR(50)",
    "goal": "VARCHAR(50)",
    "intensity": "VARCHAR(50)",
}

ROUTINE_SPLIT_METADATA_COLUMNS = {
    "day_of_week": "VARCHAR(20)",
}


def ensure_runtime_schema() -> None:
    inspector = inspect(engine)
    _ensure_columns(inspector, "routines", ROUTINE_METADATA_COLUMNS)
    _ensure_columns(inspector, "routine_splits", ROUTINE_SPLIT_METADATA_COLUMNS)


def _ensure_columns(inspector, table_name: str, expected_columns: dict[str, str]) -> None:
    if not inspector.has_table(table_name):
        return
    existing_columns = {column["name"] for column in inspector.get_columns(table_name)}
    missing_columns = [
        (column_name, column_type)
        for column_name, column_type in expected_columns.items()
        if column_name not in existing_columns
    ]

    if not missing_columns:
        return

    with engine.begin() as connection:
        for column_name, column_type in missing_columns:
            connection.execute(text(f"ALTER TABLE {table_name} ADD COLUMN {column_name} {column_type}"))

    logger.info(
        "%s metadata columns ensured: %s",
        table_name,
        ", ".join(column_name for column_name, _ in missing_columns),
    )
