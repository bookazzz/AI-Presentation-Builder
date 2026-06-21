"""Parse service — delegation to parsers."""
import logging
from .txt_parser import TxtParser
from .docx_parser import DocxParser
from .pdf_parser import PdfParser
from .excel_parser import ExcelParser

logger = logging.getLogger(__name__)


class ParseService:
    def __init__(self):
        self.parsers = {
            "txt": TxtParser(),
            "docx": DocxParser(),
            "pdf": PdfParser(),
            "xlsx": ExcelParser(),
            "xls": ExcelParser(),
            "csv": ExcelParser(),
        }

    def parse(self, file_path: str, ext: str) -> dict:
        parser = self.parsers.get(ext)
        if not parser:
            return {"text": f"[Unsupported format: .{ext}]"}
        return parser.parse(file_path)


parse_service = ParseService()
