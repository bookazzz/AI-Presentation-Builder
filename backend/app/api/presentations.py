"""Presentation CRUD and generation endpoints."""

import json
import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Presentation, PresentationStatus, GenerationTask
from app.services.presentation_orchestrator import presentation_orchestrator

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Schemas ─────────────────────────────────────

class CreatePresentationRequest(BaseModel):
    title: str
    type: str | None = None
    audience: str | None = None
    style: str | None = None
    language: str = "ru"
    slides_count: int = 10
    source_text: str | None = None
    source_file_id: int | None = None


class UpdatePresentationRequest(BaseModel):
    title: str | None = None
    type: str | None = None
    audience: str | None = None
    style: str | None = None
    language: str | None = None
    slides_count: int | None = None
    slides_json: str | None = None  # Full updated presentation JSON


# ── Endpoints ────────────────────────────────────

@router.post("/", status_code=201)
async def create_presentation(
    req: CreatePresentationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    pres = Presentation(
        user_id=user.id,
        title=req.title,
        type=req.type,
        audience=req.audience,
        style=req.style,
        language=req.language,
        slides_count=req.slides_count,
        source_file_id=req.source_file_id,
        status=PresentationStatus.draft,
    )
    # Store raw text for text-based presentations
    if req.source_text:
        pres.presentation_json = json.dumps({
            "raw_text": req.source_text,
            "source_content_type": "text",
        })

    db.add(pres)
    await db.commit()
    await db.refresh(pres)

    return {
        "id": pres.id,
        "title": pres.title,
        "status": pres.status.value,
        "type": pres.type,
    }


@router.get("/")
async def list_presentations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Presentation)
        .where(Presentation.user_id == user.id)
        .order_by(Presentation.created_at.desc())
    )
    presentations = result.scalars().all()
    return [
        {
            "id": p.id,
            "title": p.title,
            "type": p.type,
            "style": p.style,
            "status": p.status.value if hasattr(p.status, 'value') else p.status,
            "slides_count": p.slides_count,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in presentations
    ]


@router.get("/{pres_id}")
async def get_presentation(
    pres_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Presentation).where(Presentation.id == pres_id, Presentation.user_id == user.id)
    )
    pres = result.scalar_one_or_none()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")

    slides = None
    if pres.presentation_json:
        try:
            parsed = json.loads(pres.presentation_json)
            slides = parsed.get("slides", parsed.get("outline", parsed))
        except (json.JSONDecodeError, TypeError):
            slides = None

    return {
        "id": pres.id,
        "title": pres.title,
        "type": pres.type,
        "audience": pres.audience,
        "style": pres.style,
        "language": pres.language,
        "status": pres.status.value if hasattr(pres.status, 'value') else pres.status,
        "slides_count": pres.slides_count,
        "slides_data": slides,
        "source_file_id": pres.source_file_id,
        "created_at": pres.created_at.isoformat() if pres.created_at else None,
        "updated_at": pres.updated_at.isoformat() if pres.updated_at else None,
    }


@router.patch("/{pres_id}")
async def update_presentation(
    pres_id: int,
    req: UpdatePresentationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Presentation).where(Presentation.id == pres_id, Presentation.user_id == user.id)
    )
    pres = result.scalar_one_or_none()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")

    update_data = req.model_dump(exclude_unset=True)
    for field in ("title", "type", "audience", "style", "language", "slides_count"):
        if field in update_data:
            setattr(pres, field, update_data[field])

    if req.slides_json:
        pres.presentation_json = req.slides_json

    await db.commit()
    return {"status": "updated"}


@router.delete("/{pres_id}")
async def delete_presentation(
    pres_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Presentation).where(Presentation.id == pres_id, Presentation.user_id == user.id)
    )
    pres = result.scalar_one_or_none()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")
    await db.delete(pres)
    await db.commit()
    return {"status": "deleted"}


# ── Generation endpoints ────────────────────────

@router.post("/{pres_id}/generate-outline")
async def generate_outline(
    pres_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Step 1: Generate presentation outline from source data."""
    try:
        result = await presentation_orchestrator.generate_outline(
            presentation_id=pres_id,
            user_id=user.id,
            db=db,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Outline generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Outline generation failed")


@router.post("/{pres_id}/generate-slides")
async def generate_slides(
    pres_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Step 2: Generate full slide content from confirmed outline."""
    try:
        result = await presentation_orchestrator.generate_slides(
            presentation_id=pres_id,
            user_id=user.id,
            db=db,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Slide generation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Slide generation failed")


@router.post("/{pres_id}/regenerate-slide/{slide_number}")
async def regenerate_slide(
    pres_id: int,
    slide_number: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Regenerate a single slide by number."""
    try:
        result = await presentation_orchestrator.regenerate_slide(
            presentation_id=pres_id,
            slide_number=slide_number,
            user_id=user.id,
            db=db,
        )
        return {"status": "regenerated", "slide": result}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Slide regeneration error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Slide regeneration failed")


@router.get("/{pres_id}/tasks")
async def get_generation_tasks(
    pres_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get generation tasks for a presentation."""
    result = await db.execute(
        select(GenerationTask)
        .where(GenerationTask.presentation_id == pres_id, GenerationTask.user_id == user.id)
        .order_by(GenerationTask.created_at.desc())
    )
    tasks = result.scalars().all()
    return [
        {
            "id": t.id,
            "task_type": t.task_type,
            "status": t.status,
            "progress": t.progress,
            "error_message": t.error_message,
            "started_at": t.started_at.isoformat() if t.started_at else None,
            "finished_at": t.finished_at.isoformat() if t.finished_at else None,
        }
        for t in tasks
    ]
