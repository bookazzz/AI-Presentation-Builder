"""Plain text (.txt) parser."""

import os
from .base import BaseParser, ParseResult


class TextParser(BaseParser):
    supported_extensions = ["txt"]

    def parse(self, file_path: str, original_name: str) -> ParseResult:
        with open(file_path, "r", encoding="utf-8", errors="replace") as f:
            text = f.read()

        title = os.path.splitext(original_name)[0]

        return ParseResult(
            content_type="text",
            raw_text=text.strip(),
            language=self._detect_language(text),
            title=title,
        )

    def _detect_language(self, text: str) -> str:
        """Simple language detection based on character ranges."""
        if not text.strip():
            return "ru"
        cyrillic = sum(1 for c in text if "\u0400" <= c <= "\u04FF")
        latin = sum(1 for c in text if c.isascii() and c.isalpha())
        return "ru" if cyrillic > latin else "en"
