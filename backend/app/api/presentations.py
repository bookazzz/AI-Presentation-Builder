from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Presentation, PresentationStatus, GenerationTask

router = APIRouter()


class CreatePresentationRequest(BaseModel):
    title: str
    type: str | None = None
    audience: str | None = None
    style: str | None = None
    language: str = "ru"
    slides_count: int = 10
    source_text: str | None = None
    source_file_id: int | None = None


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
        status=PresentationStatus.draft,
    )
    db.add(pres)
    await db.commit()
    await db.refresh(pres)
    return {"id": pres.id, "title": pres.title, "status": pres.status.value}


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
    return {
        "id": pres.id,
        "title": pres.title,
        "type": pres.type,
        "status": pres.status.value if hasattr(pres.status, 'value') else pres.status,
        "slides_count": pres.slides_count,
        "slides": pres.presentation_json,
        "created_at": pres.created_at.isoformat() if pres.created_at else None,
    }


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


@router.post("/{pres_id}/generate-outline")
async def generate_outline(
    pres_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # TODO: LLM call for outline generation
    return {"status": "outline_generated", "outline": []}


@router.post("/{pres_id}/generate-slides")
async def generate_slides(
    pres_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # TODO: LLM call for slides generation
    return {"status": "generating", "task_id": None}
