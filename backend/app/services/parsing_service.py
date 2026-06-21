"""Parsing service — orchestrates file parsing and updates File record."""

import os
import logging
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.models.models import File
from app.services.parsers import (
    BaseParser,
    ParseResult,
    TextParser,
    DocxParser,
    PdfParser,
    ExcelParser,
)

logger = logging.getLogger(__name__)


class ParsingService:
    """Orchestrates file parsing."""

    def __init__(self):
        self.parsers: list[BaseParser] = [
            TextParser(),
            DocxParser(),
            PdfParser(),
            ExcelParser(),
        ]

    def get_parser(self, filename: str, mime_type: Optional[str] = None) -> Optional[BaseParser]:
        for parser in self.parsers:
            if parser.can_parse(filename, mime_type):
                return parser
        return None

    async def parse_file(self, file_id: int, db: AsyncSession) -> File:
        """Parse a file by its ID, update DB record and return updated File."""
        result = await db.execute(select(File).where(File.id == file_id))
        file_record: File = result.scalar_one_or_none()
        if not file_record:
            raise ValueError(f"File {file_id} not found")

        # Set status
        file_record.status = "parsing"
        await db.commit()

        try:
            parser = self.get_parser(file_record.original_name, file_record.mime_type)
            if not parser:
                file_record.status = "failed"
                # TODO: store error message
                await db.commit()
                logger.warning(f"No parser for file: {file_record.original_name}")
                return file_record

            parse_result: ParseResult = parser.parse(
                file_record.storage_path,
                file_record.original_name,
            )

            # Save extracted text
            if parse_result.raw_text:
                text_path = file_record.storage_path + ".txt"
                os.makedirs(os.path.dirname(text_path), exist_ok=True)
                with open(text_path, "w", encoding="utf-8") as f:
                    f.write(parse_result.raw_text)
                file_record.extracted_text_path = text_path

            file_record.status = "parsed"
            await db.commit()
            logger.info(f"File {file_id} parsed: type={parse_result.content_type}, "
                        f"text_len={len(parse_result.raw_text)}, "
                        f"insights={len(parse_result.insights)}, "
                        f"charts={len(parse_result.charts)}")

        except Exception as e:
            file_record.status = "failed"
            await db.commit()
            logger.error(f"Parse error for file {file_id}: {e}", exc_info=True)
            raise

        return file_record


parsing_service = ParsingService()
