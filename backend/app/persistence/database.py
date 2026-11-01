"""SQLAlchemy engine and session configuration."""

import os
from collections.abc import Iterator
from pathlib import Path

from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[2] / "data" / "schedule.db"
DEFAULT_DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
DATABASE_URL = os.getenv("SCHEDULE_DATABASE_URL", f"sqlite:///{DEFAULT_DATABASE_PATH.as_posix()}")


class Base(DeclarativeBase):
    """Base for SQLAlchemy metadata."""


def create_database_engine(database_url: str = DATABASE_URL) -> Engine:
    """Create a database engine, enabling SQLite's thread-safe test/dev access."""
    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    return create_engine(database_url, connect_args=connect_args, pool_pre_ping=True)


engine = create_database_engine()
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def get_session() -> Iterator[Session]:
    """Yield one short-lived session for a request."""
    with SessionLocal() as session:
        yield session
