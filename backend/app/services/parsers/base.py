"""Base parser with common interface and result model."""

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class ParseResult:
    """Result of file parsing."""
    content_type: str  # "text" | "excel" | "unknown"
    raw_text: str
    language: str = "ru"
    title: Optional[str] = None
    summary: Optional[str] = None
    # For Excel files
    sheets: List[dict] = field(default_factory=list)  # [{name, headers, rows, columns, numeric_cols, date_cols}]
    charts: List[dict] = field(default_factory=list)   # [{type, title, labels, values, sheet}]
    insights: List[str] = field(default_factory=list)  # auto-calculated insights
    # Errors
    errors: List[str] = field(default_factory=list)


class BaseParser:
    """Abstract file parser."""

    supported_extensions: list = []

    def can_parse(self, filename: str, mime_type: Optional[str] = None) -> bool:
        ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        return ext in self.supported_extensions

    def parse(self, file_path: str, original_name: str) -> ParseResult:
        raise NotImplementedError
