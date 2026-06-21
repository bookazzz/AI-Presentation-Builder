"""PDF (.pdf) parser using pdfminer."""

import os
from io import StringIO
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams
from .base import BaseParser, ParseResult


class PdfParser(BaseParser):
    supported_extensions = ["pdf"]

    def parse(self, file_path: str, original_name: str) -> ParseResult:
        output = StringIO()
        with open(file_path, "rb") as f:
            extract_text_to_fp(f, output, laparams=LAParams(), output_type="text", codec="utf-8")
        raw_text = output.getvalue().strip()

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
