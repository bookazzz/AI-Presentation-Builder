"""All SQLAlchemy models."""
from sqlalchemy import String, Text, Integer, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime, timezone
import uuid

from app.core.database import Base
from app.models import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="user")
    plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("plans.id"), nullable=True)
    is_blocked: Mapped[bool] = mapped_column(Boolean, default=False)
    last_login_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    presentations = relationship("Presentation", back_populates="user")
    files = relationship("File", back_populates="user")
    tasks = relationship("GenerationTask", back_populates="user")


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


class File(Base, TimestampMixin):
    __tablename__ = "files"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    original_name: Mapped[str] = mapped_column(String(500), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=True)
    size: Mapped[int] = mapped_column(Integer, default=0)
    storage_path: Mapped[str] = mapped_column(String(1000), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="uploaded")
    extracted_text_path: Mapped[str] = mapped_column(String(1000), nullable=True)
    user = relationship("User", back_populates="files")
    presentations = relationship("Presentation", backref="source_file_rel", foreign_keys=[Presentation.source_file_id])


class GenerationTask(Base, TimestampMixin):
    __tablename__ = "generation_tasks"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    presentation_id: Mapped[str] = mapped_column(String(36), ForeignKey("presentations.id"), nullable=False)
    task_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    error_message: Mapped[str] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    finished_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    presentation = relationship("Presentation", back_populates="tasks")
    user = relationship("User", back_populates="tasks")


class Export(Base, TimestampMixin):
    __tablename__ = "exports"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    presentation_id: Mapped[str] = mapped_column(String(36), ForeignKey("presentations.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    format: Mapped[str] = mapped_column(String(10), nullable=False)
    file_path: Mapped[str] = mapped_column(String(1000), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    presentation = relationship("Presentation", back_populates="exports")


class Plan(Base, TimestampMixin):
    __tablename__ = "plans"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(Float, default=0)
    presentations_limit: Mapped[int] = mapped_column(Integer, default=3)
    slides_limit: Mapped[int] = mapped_column(Integer, default=8)
    max_file_size: Mapped[int] = mapped_column(Integer, default=20)
    pptx_export_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    pdf_export_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    watermark_enabled: Mapped[bool] = mapped_column(Boolean, default=True)


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    plan_id: Mapped[str] = mapped_column(String(36), ForeignKey("plans.id"), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="RUB")
    status: Mapped[str] = mapped_column(String(50), default="pending")
    provider: Mapped[str] = mapped_column(String(50), nullable=True)
    provider_payment_id: Mapped[str] = mapped_column(String(255), nullable=True)


class UsageLog(Base, TimestampMixin):
    __tablename__ = "usage_logs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    presentation_id: Mapped[str] = mapped_column(String(36), ForeignKey("presentations.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    tokens_used: Mapped[int] = mapped_column(Integer, nullable=True)
    provider: Mapped[str] = mapped_column(String(50), nullable=True)
    cost: Mapped[float] = mapped_column(Float, nullable=True)
