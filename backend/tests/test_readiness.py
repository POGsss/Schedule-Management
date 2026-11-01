"""Integration checks for database-backed readiness."""

from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine

from backend.app import main


def test_readiness_requires_database_migrations(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Readiness reports not-ready until the baseline schema is migrated."""
    database_file = tmp_path / "schedule.db"
    database_url = f"sqlite:///{database_file.as_posix()}"
    test_engine = create_engine(database_url, connect_args={"check_same_thread": False})
    monkeypatch.setattr(main, "engine", test_engine)
    client = TestClient(main.app)

    before = client.get("/api/health/ready")
    assert before.status_code == 503
    assert before.json()["detail"] == "Database migrations have not been applied"

    config = Config("backend/alembic.ini")
    config.set_main_option("sqlalchemy.url", database_url)
    command.upgrade(config, "head")

    after = client.get("/api/health/ready")
    assert after.status_code == 200
    assert after.json() == {"status": "ready", "database": "ready"}
    test_engine.dispose()


def test_readiness_returns_actionable_unavailable_error(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A database connection failure never returns a false ready status."""
    unreachable_engine = create_engine(f"sqlite:///{tmp_path / 'missing' / 'db.sqlite'}")
    monkeypatch.setattr(main, "engine", unreachable_engine)
    response = TestClient(main.app).get("/api/health/ready")
    assert response.status_code == 503
    assert response.json()["detail"] == "Database is unavailable"
    unreachable_engine.dispose()
