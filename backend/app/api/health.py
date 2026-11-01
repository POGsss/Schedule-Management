"""Health and readiness endpoints."""

from fastapi import HTTPException
from sqlalchemy import Engine, inspect, text
from sqlalchemy.exc import SQLAlchemyError


def readiness(engine: Engine) -> dict[str, str]:
    """Confirm the database is reachable and the baseline migration was applied."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            tables = inspect(connection).get_table_names()
    except SQLAlchemyError as error:
        raise HTTPException(status_code=503, detail="Database is unavailable") from error

    if "alembic_version" not in tables or "app_metadata" not in tables:
        raise HTTPException(status_code=503, detail="Database migrations have not been applied")

    return {"status": "ready", "database": "ready"}
