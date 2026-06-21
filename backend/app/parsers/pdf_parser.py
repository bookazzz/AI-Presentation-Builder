"""PDF file parser."""
import logging
from .base import BaseParser

logger = logging.getLogger(__name__)


class PdfParser(BaseParser):
    def parse(self, file_path: str) -> dict:
        from pdfminer.high_level import extract_text
        text = extract_text(file_path)
        return {"text": text, "language": self._detect_language(text)}

    def _detect_language(self, text: str) -> str:
        import re
        ru_chars = len(re.findall(r'[а-яА-ЯёЁ]', text))
        en_chars = len(re.findall(r'[a-zA-Z]', text))
        return "ru" if ru_chars > en_chars else "en"
