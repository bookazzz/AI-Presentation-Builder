"""Plan model."""

from sqlalchemy import String, Integer, Float, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from . import Base, TimestampMixin
import uuid


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
    excel_analysis_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    brand_kit_enabled: Mapped[bool] = mapped_column(Boolean, default=False)
