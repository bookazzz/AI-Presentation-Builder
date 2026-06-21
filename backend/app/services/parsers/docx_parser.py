"""DOCX (.docx) parser."""

import os
from docx import Document
from .base import BaseParser, ParseResult


class DocxParser(BaseParser):
    supported_extensions = ["docx"]

    def parse(self, file_path: str, original_name: str) -> ParseResult:
        doc = Document(file_path)

        paragraphs = []
        for p in doc.paragraphs:
            text = p.text.strip()
            if text:
                paragraphs.append(text)

        raw_text = "\n\n".join(paragraphs)
        title = os.path.splitext(original_name)[0]

        return ParseResult(
            content_type="text",
            raw_text=raw_text,
            language=self._detect_language(raw_text),
            title=title,
        )

    def _detect_language(self, text: str) -> str:
        if not text.strip():
            return "ru"
        cyrillic = sum(1 for c in text if "\u0400" <= c <= "\u04FF")
        latin = sum(1 for c in text if c.isascii() and c.isalpha())
        return "ru" if cyrillic > latin else "en"
