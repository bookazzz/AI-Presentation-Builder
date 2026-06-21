"""Usage log model."""

from sqlalchemy import String, Integer, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from . import Base, TimestampMixin
import uuid


class UsageLog(Base, TimestampMixin):
    __tablename__ = "usage_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False)
    presentation_id: Mapped[str] = mapped_column(String(36), ForeignKey("presentations.id"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    tokens_used: Mapped[int] = mapped_column(Integer, default=0)
    provider: Mapped[str] = mapped_column(String(50), nullable=True)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
