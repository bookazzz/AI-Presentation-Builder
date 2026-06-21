from typing import Optional
from app.schemas import CreatePresentationRequest, UpdatePresentationRequest
"""Presentation CRUD and generation endpoints."""
import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Presentation, GenerationTask, Export

logger = logging.getLogger(__name__)
router = APIRouter()

# --- Schemas ---

# --- CRUD ---

@router.post("")
@router.post("/")
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
        status="draft",
    )
    db.add(pres)
    await db.commit()
    await db.refresh(pres)
    return _serialize_presentation(pres)

@router.get("")
@router.get("/")
async def list_presentations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Presentation)
        .where(Presentation.user_id == user.id)
        .order_by(desc(Presentation.created_at))
    )
    pres_list = result.scalars().all()
    return [_serialize_presentation(p) for p in pres_list]

@router.get("/{pres_id}")
async def get_presentation(
    pres_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Presentation).where(Presentation.id == pres_id, Presentation.user_id == user.id)
    )
    pres = result.scalar_one_or_none()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")
    return _serialize_presentation(pres)

@router.patch("/{pres_id}")
async def update_presentation(
    pres_id: str,
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
    # presentation_json comes as dict, needs to be serialized
    if "presentation_json" in update_data and update_data["presentation_json"] is not None:
        update_data["presentation_json"] = json.dumps(update_data["presentation_json"], ensure_ascii=False)

    for key, value in update_data.items():
        setattr(pres, key, value)

    await db.commit()
    await db.refresh(pres)
    return _serialize_presentation(pres)

@router.delete("/{pres_id}")
async def delete_presentation(
    pres_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Presentation).where(Presentation.id == pres_id, Presentation.user_id == user.id)
    )
    pres = result.scalar_one_or_none()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")
    # Cascading delete related records
    tasks_result = await db.execute(
        select(GenerationTask).where(GenerationTask.presentation_id == pres.id)
    )
    for t in tasks_result.scalars().all():
        await db.delete(t)

    exports_result = await db.execute(
        select(Export).where(Export.presentation_id == pres.id)
    )
    for e in exports_result.scalars().all():
        await db.delete(e)

    await db.delete(pres)
    await db.commit()
    return {"status": "deleted"}

# --- Generation ---

@router.post("/{pres_id}/generate-outline")
async def generate_outline(
    pres_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate presentation outline/structure."""
    result = await db.execute(
        select(Presentation).where(Presentation.id == pres_id, Presentation.user_id == user.id)
    )
    pres = result.scalar_one_or_none()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")

    # Create task
    task = GenerationTask(
        user_id=user.id,
        presentation_id=pres.id,
        task_type="outline",
        status="processing",
        progress=10,
        started_at=datetime.now(timezone.utc),
    )
    db.add(task)
    await db.commit()

    # Generate outline (fallback template if no LLM key)
    try:
        outline = _generate_outline_fallback(pres)
        pres.presentation_json = json.dumps(outline, ensure_ascii=False)
        pres.status = "outline_generated"
        pres.slides_count = len(outline.get("slides", []))
        task.status = "completed"
        task.progress = 100
        task.finished_at = datetime.now(timezone.utc)
        await db.commit()
    except Exception as e:
        task.status = "failed"
        task.error_message = str(e)
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Outline generation failed: {e}")

    return {"id": task.id, "status": "completed", "progress": 100}

@router.post("/{pres_id}/generate-slides")
async def generate_slides(
    pres_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate slide content from outline."""
    result = await db.execute(
        select(Presentation).where(Presentation.id == pres_id, Presentation.user_id == user.id)
    )
    pres = result.scalar_one_or_none()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")

    task = GenerationTask(
        user_id=user.id,
        presentation_id=pres.id,
        task_type="slides",
        status="processing",
        progress=10,
        started_at=datetime.now(timezone.utc),
    )
    db.add(task)
    await db.commit()

    try:
        enriched = _enrich_slides_fallback(pres)
        pres.presentation_json = json.dumps(enriched, ensure_ascii=False)
        pres.status = "completed"
        pres.slides_count = len(enriched.get("slides", []))
        task.status = "completed"
        task.progress = 100
        task.finished_at = datetime.now(timezone.utc)
        await db.commit()
    except Exception as e:
        task.status = "failed"
        task.error_message = str(e)
        await db.commit()
        raise HTTPException(status_code=500, detail=f"Slide generation failed: {e}")

    return {"id": task.id, "status": "completed", "progress": 100}

@router.post("/{pres_id}/regenerate-slide/{slide_index}")
async def regenerate_slide(
    pres_id: str,
    slide_index: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Regenerate a specific slide."""
    result = await db.execute(
        select(Presentation).where(Presentation.id == pres_id, Presentation.user_id == user.id)
    )
    pres = result.scalar_one_or_none()
    if not pres:
        raise HTTPException(status_code=404, detail="Presentation not found")

    try:
        data = json.loads(pres.presentation_json) if pres.presentation_json else {"slides": []}
    except (json.JSONDecodeError, TypeError):
        data = {"slides": []}

    slides = data.get("slides", [])
    if slide_index < 0 or slide_index >= len(slides):
        raise HTTPException(status_code=400, detail="Invalid slide index")

    # Simple regeneration: re-enrich content
    slide = slides[slide_index]
    enriched_content = _regenerate_slide_content(slide, pres)
    slide["content"] = enriched_content
    slides[slide_index] = slide
    data["slides"] = slides

    pres.presentation_json = json.dumps(data, ensure_ascii=False)
    await db.commit()
    await db.refresh(pres)
    return _serialize_presentation(pres)

# --- Tasks ---

@router.get("/tasks/{task_id}")
async def get_task_status(
    task_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(GenerationTask).where(GenerationTask.id == task_id, GenerationTask.user_id == user.id)
    )
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {
        "id": task.id,
        "presentation_id": task.presentation_id,
        "task_type": task.task_type,
        "status": task.status,
        "progress": task.progress,
        "error_message": task.error_message,
    }

# --- Helpers ---

def _generate_outline_fallback(pres: Presentation) -> dict:
    """Template-based outline when LLM is unavailable."""
    type_name = pres.type.capitalize() if pres.type else "Presentation"
    total = pres.slides_count or 10

    slides = [
        {
            "slide_number": 1,
            "type": "cover",
            "title": pres.title or "Presentation",
            "subtitle": f"{type_name} — Overview",
            "content": [],
            "visual": {"type": "none"},
        },
        {
            "slide_number": 2,
            "type": "section",
            "title": "Context",
            "content": ["Key context and background information for this presentation"],
            "visual": {"type": "none"},
        },
    ]

    content_count = max(3, total - 4)
    for i in range(content_count):
        slides.append({
            "slide_number": len(slides) + 1,
            "type": "content",
            "title": f"Key Point {i + 1}",
            "content": [
                "Main thesis and supporting argument",
                "Supporting data point or example",
                "Implication or conclusion",
            ],
            "visual": {"type": "none"},
        })

    slides.append({
        "slide_number": len(slides) + 1,
        "type": "section",
        "title": "Key Findings",
        "content": ["Summary of the most important conclusions"],
        "visual": {"type": "none"},
    })
    slides.append({
        "slide_number": len(slides) + 1,
        "type": "cta",
        "title": "Next Steps",
        "content": ["Action items and recommendations"],
        "visual": {"type": "none"},
    })

    return {
        "title": pres.title,
        "language": pres.language or "ru",
        "style": pres.style or "business",
        "slides": slides,
    }

def _enrich_slides_fallback(pres: Presentation) -> dict:
    """Enrich outline with more detailed fallback content."""
    try:
        data = json.loads(pres.presentation_json) if pres.presentation_json else {}
    except (json.JSONDecodeError, TypeError):
        data = {}

    slides = data.get("slides", [])
    for slide in slides:
        if not slide.get("content") or len(slide.get("content", [])) < 2:
            s_type = slide.get("type", "content")
            if s_type == "cover":
                slide["content"] = []
            elif s_type == "content":
                slide["content"] = [
                    f"Key insight related to: {slide.get('title', 'Topic')}",
                    "Supporting evidence and data points",
                    "Business implication and recommended action",
                    "Metric or KPI that validates this direction",
                ]
            elif s_type == "section":
                slide["content"] = [
                    f"Overview of: {slide.get('title', 'Section')}",
                    "Main conclusion derived from the analysis",
                ]
            elif s_type == "cta":
                slide["content"] = [
                    "Define specific actions based on findings",
                    "Set timeline and responsibility for each action item",
                    "Establish metrics to track progress",
                ]

    return {
        "title": data.get("title", pres.title),
        "language": data.get("language", pres.language or "ru"),
        "style": data.get("style", pres.style or "business"),
        "slides": slides,
    }

def _regenerate_slide_content(slide: dict, pres: Presentation) -> list:
    """Re-generate content for a single slide."""
    s_type = slide.get("type", "content")
    title = slide.get("title", "Slide")
    if s_type == "cover":
        return []
    elif s_type == "content":
        return [
            f"Updated insight: {title}",
            "Revised supporting evidence",
            "Revised business implication",
        ]
    elif s_type == "section":
        return [f"Summary of {title}", "Key takeaways"]
    elif s_type == "cta":
        return ["Recommended actions", "Timeline", "Owner & metrics"]
    return [f"Content for {title}"]

def _serialize_presentation(p: Presentation) -> dict:
    """Convert Presentation ORM to dict."""
    json_data = None
    if p.presentation_json:
        try:
            json_data = json.loads(p.presentation_json)
        except (json.JSONDecodeError, TypeError):
            json_data = None

    return {
        "id": p.id,
        "title": p.title,
        "type": p.type,
        "audience": p.audience,
        "style": p.style,
        "language": p.language,
        "status": p.status,
        "slides_count": p.slides_count,
        "source_file_id": p.source_file_id,
        "presentation_json": json_data,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "updated_at": p.updated_at.isoformat() if p.updated_at else None,
    }
