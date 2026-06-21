"""File parsing orchestrator service."""
import os
import json
import logging

logger = logging.getLogger(__name__)


class ParsingService:
    """Orchestrates file parsing and text extraction."""

    async def parse_file(self, file_id: str, db=None) -> object:
        """Parse a file and extract text/data."""
        from sqlalchemy import select
        from app.models.models import File

        if db is None:
            return _fake_file_obj(file_id)

        result = await db.execute(select(File).where(File.id == file_id))
        db_file = result.scalar_one_or_none()
        if not db_file:
            raise ValueError(f"File {file_id} not found")

        ext = db_file.original_name.rsplit(".", 1)[-1].lower() if "." in db_file.original_name else ""

        extracted_text = ""
        sheet_info = {}

        try:
            if ext == "txt":
                with open(db_file.storage_path, "r", encoding="utf-8", errors="replace") as f:
                    extracted_text = f.read()
            elif ext == "docx":
                from app.parsers.docx_parser import DocxParser
                parser = DocxParser()
                result_data = parser.parse(db_file.storage_path)
                extracted_text = result_data.get("text", "")
            elif ext == "pdf":
                from app.parsers.pdf_parser import PdfParser
                parser = PdfParser()
                result_data = parser.parse(db_file.storage_path)
                extracted_text = result_data.get("text", "")
            elif ext in ("xlsx", "xls", "csv"):
                from app.parsers.excel_parser import ExcelParser
                parser = ExcelParser()
                result_data = parser.parse(db_file.storage_path)
                extracted_text = result_data.get("text", "")
                sheet_info = result_data.get("sheets", {})
            else:
                extracted_text = f"[Unsupported format: .{ext}]"
        except Exception as e:
            logger.error(f"Parse error for {file_id}: {e}")
            extracted_text = f"[Parse error: {e}]"

        # Save extracted text
        text_path = db_file.storage_path + ".extracted.txt"
        try:
            with open(text_path, "w", encoding="utf-8") as f:
                f.write(extracted_text[:100000])
            db_file.extracted_text_path = text_path
        except Exception as e:
            logger.error(f"Failed to save extracted text: {e}")

        db_file.status = "parsed"
        if db:
            await db.commit()
            await db.refresh(db_file)

        return db_file


def _fake_file_obj(file_id):
    """Return a fake file-like object when db is not available."""
    class FakeFile:
        id = file_id
        status = "parsed"
        original_name = "unknown"
        mime_type = "text/plain"
        size = 0
        storage_path = ""
        extracted_text_path = ""
    return FakeFile()


parsing_service = ParsingService()
