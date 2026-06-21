from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum, Float
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    guest = "guest"
    user = "user"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=True)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    last_login_at = Column(DateTime(timezone=True), nullable=True)

    presentations = relationship("Presentation", back_populates="user")
    files = relationship("File", back_populates="user")


class PresentationStatus(str, enum.Enum):
    draft = "draft"
    generating = "generating"
    completed = "completed"
    failed = "failed"


class Presentation(Base):
    __tablename__ = "presentations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(500), nullable=False)
    type = Column(String(50), nullable=True)
    audience = Column(String(50), nullable=True)
    style = Column(String(50), nullable=True)
    language = Column(String(10), default="ru")
    status = Column(Enum(PresentationStatus), default=PresentationStatus.draft)
    slides_count = Column(Integer, default=0)
    source_file_id = Column(Integer, ForeignKey("files.id"), nullable=True)
    presentation_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="presentations")
    exports = relationship("Export", back_populates="presentation")
    generation_tasks = relationship("GenerationTask", back_populates="presentation")


class File(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    original_name = Column(String(500), nullable=False)
    mime_type = Column(String(100), nullable=False)
    size = Column(Integer, nullable=False)
    storage_path = Column(String(1000), nullable=False)
    status = Column(String(50), default="uploaded")
    extracted_text_path = Column(String(1000), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="files")


class GenerationTask(Base):
    __tablename__ = "generation_tasks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    presentation_id = Column(Integer, ForeignKey("presentations.id"), nullable=False)
    task_type = Column(String(50), nullable=False)
    status = Column(String(50), default="pending")
    progress = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    finished_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    presentation = relationship("Presentation", back_populates="generation_tasks")


class Export(Base):
    __tablename__ = "exports"

    id = Column(Integer, primary_key=True, autoincrement=True)
    presentation_id = Column(Integer, ForeignKey("presentations.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    format = Column(String(10), nullable=False)  # pptx, pdf
    file_path = Column(String(1000), nullable=True, default=None)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    presentation = relationship("Presentation", back_populates="exports")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    price = Column(Float, default=0)
    presentations_limit = Column(Integer, default=1)
    slides_limit = Column(Integer, default=8)
    max_file_size = Column(Integer, default=20)
    pptx_export_enabled = Column(Boolean, default=False)
    pdf_export_enabled = Column(Boolean, default=True)
    watermark_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    plan_id = Column(Integer, ForeignKey("plans.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="RUB")
    status = Column(String(50), default="pending")
    provider = Column(String(50), nullable=True)
    provider_payment_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class UsageLog(Base):
    __tablename__ = "usage_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    presentation_id = Column(Integer, ForeignKey("presentations.id"), nullable=True)
    action = Column(String(100), nullable=False)
    tokens_used = Column(Integer, default=0)
    provider = Column(String(50), nullable=True)
    cost = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
