"""Presentation model."""

from sqlalchemy import String, Text, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
from . import Base, TimestampMixin
import uuid


class Presentation(Base, TimestampMixin):
    __tablename__ = "presentations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    audience: Mapped[str] = mapped_column(String(50), nullable=True)
    style: Mapped[str] = mapped_column(String(50), nullable=True)
    language: Mapped[str] = mapped_column(String(10), default="ru")
    status: Mapped[str] = mapped_column(String(50), default="draft")
    slides_count: Mapped[int] = mapped_column(Integer, default=0)
    source_file_id: Mapped[str] = mapped_column(String(36), ForeignKey("files.id"), nullable=True)
    presentation_json: Mapped[str] = mapped_column(Text, nullable=True)

    user = relationship("User", back_populates="presentations")
    source_file = relationship("File")
    tasks = relationship("GenerationTask", back_populates="presentation")
    exports = relationship("Export", back_populates="presentation")
