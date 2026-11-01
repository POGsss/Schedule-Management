"""Small baseline table proving migration-backed persistence is available."""

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.app.persistence.database import Base


class ApplicationMetadata(Base):
    """Schema metadata reserved for app identity and future setup records."""

    __tablename__ = "app_metadata"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_name: Mapped[str] = mapped_column(String(100), nullable=False)
