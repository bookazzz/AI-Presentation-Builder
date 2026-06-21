"""Export endpoints — PPTX and PDF generation."""

import os
import logging

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Export as ExportModel, Presentation
from app.services.export_service import export_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/{pres_id}/pptx")
async def export_pptx(
    pres_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Export presentation as PPTX."""
    try:
        result = await export_service.export_pptx(
            presentation_id=pres_id,
            user_id=user.id,
            db=db,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"PPTX export error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Export failed")


@router.post("/{pres_id}/pdf")
async def export_pdf(
    pres_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Export presentation as PDF (requires LibreOffice)."""
    try:
        result = await export_service.export_pdf(
            presentation_id=pres_id,
            user_id=user.id,
            db=db,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"PDF export error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Export failed")


@router.get("/{export_id}/download")
async def download_export(
    export_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download an exported file."""
    result = await db.execute(
        select(ExportModel).where(ExportModel.id == export_id, ExportModel.user_id == user.id)
    )
    export = result.scalar_one_or_none()
    if not export or not export.file_path:
        raise HTTPException(status_code=404, detail="Export not found")
    if not os.path.exists(export.file_path):
        raise HTTPException(status_code=404, detail="File not found on disk")

    return FileResponse(
        export.file_path,
        filename=os.path.basename(export.file_path),
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation"
        if export.format == "pptx"
        else "application/pdf",
    )


@router.get("/{pres_id}/history")
async def get_export_history(
    pres_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get export history for a presentation."""
    result = await db.execute(
        select(ExportModel)
        .where(ExportModel.presentation_id == pres_id, ExportModel.user_id == user.id)
        .order_by(ExportModel.created_at.desc())
    )
    exports = result.scalars().all()
    return [
        {
            "id": e.id,
            "format": e.format,
            "status": e.status,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in exports
    ]
