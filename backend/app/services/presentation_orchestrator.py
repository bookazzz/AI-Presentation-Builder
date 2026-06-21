"""Presentation generation orchestrator — coordinates parsing, outline, content, and rendering."""

import json
import logging
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.models import Presentation, PresentationStatus, GenerationTask, File
from app.services.parsers import ParseResult
from app.services.parsing_service import parsing_service
from app.services.outline_generator import OutlineGenerator
from app.services.slide_generator import SlideGenerator
from app.services.llm import get_llm_provider

logger = logging.getLogger(__name__)


class PresentationOrchestrator:
    """Orchestrates the full presentation generation pipeline."""

    def __init__(self):
        self.outline_gen = OutlineGenerator()
        self.slide_gen = SlideGenerator()

    async def generate_outline(
        self,
        presentation_id: int,
        user_id: int,
        db: AsyncSession,
    ) -> dict:
        """Step 1: Generate outline from source content."""
        # Get presentation
        result = await db.execute(
            select(Presentation).where(Presentation.id == presentation_id, Presentation.user_id == user_id)
        )
        pres = result.scalar_one_or_none()
        if not pres:
            raise ValueError("Presentation not found")

        # Update status
        pres.status = PresentationStatus.generating
        await db.commit()

        # Create task record
        task = GenerationTask(
            user_id=user_id,
            presentation_id=presentation_id,
            task_type="outline",
            status="running",
            started_at=datetime.now(timezone.utc),
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)

        try:
            # Get source content
            source_text, content_type, sheets_data, insights, charts_data = await self._get_source_content(pres, db)

            # Generate outline
            outline = await self.outline_gen.generate(
                source_text=source_text,
                content_type=content_type or "text",
                presentation_type=pres.type,
                audience=pres.audience,
                style=pres.style,
                language=pres.language or "ru",
                target_slides=pres.slides_count or 10,
                sheets_data=sheets_data,
                insights=insights,
            )

            # Store outline in presentation JSON temporarily
            pres.presentation_json = json.dumps({
                "outline": outline.get("outline", []),
                "title": outline.get("title", pres.title),
                "type": outline.get("type", pres.type),
                "language": outline.get("language", pres.language),
                "source_content_type": content_type,
                "charts_data": charts_data or [],
                "insights": insights or [],
            })
            pres.slides_count = len(outline.get("outline", []))

            # Update task
            task.status = "completed"
            task.finished_at = datetime.now(timezone.utc)

            await db.commit()

            return {
                "status": "outline_generated",
                "outline": outline.get("outline", []),
                "title": outline.get("title", pres.title),
                "total_slides": len(outline.get("outline", [])),
                "presentation_id": presentation_id,
            }

        except Exception as e:
            pres.status = PresentationStatus.failed
            task.status = "failed"
            task.error_message = str(e)
            task.finished_at = datetime.now(timezone.utc)
            await db.commit()
            logger.error(f"Outline generation failed for {presentation_id}: {e}", exc_info=True)
            raise

    async def generate_slides(
        self,
        presentation_id: int,
        user_id: int,
        db: AsyncSession,
    ) -> dict:
        """Step 2: Generate full slide content from confirmed outline."""
        result = await db.execute(
            select(Presentation).where(Presentation.id == presentation_id, Presentation.user_id == user_id)
        )
        pres = result.scalar_one_or_none()
        if not pres:
            raise ValueError("Presentation not found")

        pres.status = PresentationStatus.generating
        await db.commit()

        task = GenerationTask(
            user_id=user_id,
            presentation_id=presentation_id,
            task_type="slides",
            status="running",
            started_at=datetime.now(timezone.utc),
        )
        db.add(task)
        await db.commit()
        await db.refresh(task)

        try:
            # Get source content
            source_text, content_type, sheets_data, insights, charts_data = await self._get_source_content(pres, db)

            # Parse stored outline from presentation_json
            pres_json = json.loads(pres.presentation_json) if pres.presentation_json else {}
            outline = pres_json if "outline" in pres_json else {"outline": []}
            if not outline.get("outline"):
                # Generate outline first if not present
                outline_result = await self.outline_gen.generate(
                    source_text=source_text,
                    content_type=content_type or "text",
                    presentation_type=pres.type,
                    audience=pres.audience,
                    style=pres.style,
                    language=pres.language or "ru",
                    target_slides=pres.slides_count or 10,
                )
                outline = outline_result

            # Generate slide content
            result = await self.slide_gen.generate(
                outline=outline,
                source_text=source_text,
                content_type=content_type or "text",
                charts_data=charts_data,
                insights=insights,
                style=pres.style or "business",
                language=pres.language or "ru",
            )

            # Final validation
            self._validate_slides(result)

            # Save final JSON
            pres.presentation_json = json.dumps(result, ensure_ascii=False)
            pres.slides_count = len(result.get("slides", []))
            pres.status = PresentationStatus.completed

            task.status = "completed"
            task.finished_at = datetime.now(timezone.utc)
            await db.commit()

            return {
                "status": "completed",
                "slides": result.get("slides", []),
                "title": result.get("title", pres.title),
                "total_slides": len(result.get("slides", [])),
            }

        except Exception as e:
            pres.status = PresentationStatus.failed
            task.status = "failed"
            task.error_message = str(e)
            task.finished_at = datetime.now(timezone.utc)
            await db.commit()
            logger.error(f"Slide generation failed for {presentation_id}: {e}", exc_info=True)
            raise

    async def regenerate_slide(
        self,
        presentation_id: int,
        slide_number: int,
        user_id: int,
        db: AsyncSession,
    ) -> dict:
        """Regenerate a single slide."""
        result = await db.execute(
            select(Presentation).where(Presentation.id == presentation_id, Presentation.user_id == user_id)
        )
        pres = result.scalar_one_or_none()
        if not pres or not pres.presentation_json:
            raise ValueError("Presentation not found or empty")

        full = json.loads(pres.presentation_json)
        slides = full.get("slides", [])

        if slide_number < 1 or slide_number > len(slides):
            raise ValueError(f"Slide number {slide_number} out of range")

        source_text, _, _, _, _ = await self._get_source_content(pres, db)

        # Generate just the specific slide
        slide_outline = {
            "outline": [{
                "slide_number": slide_number,
                "type": slides[slide_number - 1].get("type", "thesis"),
                "title": slides[slide_number - 1].get("title", ""),
                "description": "",
            }]
        }

        result = await self.slide_gen.generate(
            outline=slide_outline,
            source_text=source_text,
            style=pres.style or "business",
            language=pres.language or "ru",
        )

        if result.get("slides"):
            slides[slide_number - 1] = result["slides"][0]
            full["slides"] = slides
            pres.presentation_json = json.dumps(full, ensure_ascii=False)
            await db.commit()

        return slides[slide_number - 1]

    async def _get_source_content(self, pres: Presentation, db: AsyncSession) -> tuple:
        """Extract source text and data from presentation's source."""
        source_text = ""
        content_type = "text"
        sheets_data = []
        insights = []
        charts_data = []

        if pres.presentation_json:
            try:
                parsed = json.loads(pres.presentation_json)
                charts_data = parsed.get("charts_data", [])
                insights = parsed.get("insights", [])
                content_type = parsed.get("source_content_type", "text")
            except (json.JSONDecodeError, TypeError):
                pass

        # Try to get text from source file
        if pres.source_file_id:
            file_result = await db.execute(
                select(File).where(File.id == pres.source_file_id)
            )
            file_record = file_result.scalar_one_or_none()
            if file_record and file_record.extracted_text_path:
                try:
                    with open(file_record.extracted_text_path, "r", encoding="utf-8", errors="replace") as f:
                        source_text = f.read()
                    content_type = "excel" if file_record.mime_type and "spreadsheet" in file_record.mime_type else "text"
                except FileNotFoundError:
                    logger.warning(f"Extracted text file not found: {file_record.extracted_text_path}")
        else:
            # Use directly stored text from presentation creation
            if pres.presentation_json:
                try:
                    parsed = json.loads(pres.presentation_json)
                    source_text = parsed.get("raw_text", source_text)
                except (json.JSONDecodeError, TypeError):
                    pass

        return source_text, content_type, sheets_data, insights, charts_data

    def _validate_slides(self, presentation: dict):
        """Validate slide content before saving."""
        for slide in presentation.get("slides", []):
            # Truncate long titles
            if len(slide.get("title", "")) > 100:
                slide["title"] = slide["title"][:97] + "..."
            # Truncate long bullets
            if slide.get("content"):
                slide["content"] = [
                    b[:143] + "..." if len(b) > 143 else b
                    for b in slide["content"]
                ]


presentation_orchestrator = PresentationOrchestrator()
