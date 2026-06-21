"""File upload, download, and parsing trigger."""

import os
import uuid
import logging

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.models import User, File
from app.services.parsing_service import parsing_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Read file
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds {settings.max_file_size_mb}MB limit",
        )

    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename is required")

    # Validate extension
    allowed_exts = {"txt", "docx", "pdf", "xlsx", "xls", "csv"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format: .{ext}. Allowed: {', '.join(allowed_exts)}",
        )

    # Save to disk
    unique_name = f"{uuid.uuid4()}.{ext}"
    upload_path = os.path.join(settings.upload_dir, str(user.id), unique_name)
    os.makedirs(os.path.dirname(upload_path), exist_ok=True)

    with open(upload_path, "wb") as f:
        f.write(contents)

    # Create DB record
    db_file = File(
        user_id=user.id,
        original_name=file.filename,
        mime_type=file.content_type or "application/octet-stream",
        size=file_size,
        storage_path=upload_path,
        status="uploaded",
    )
    db.add(db_file)
    await db.commit()
    await db.refresh(db_file)

    # Parse file in background (async within same request for now;
    # in production this would go to Celery)
    try:
        db_file = await parsing_service.parse_file(db_file.id, db)
    except Exception as e:
        logger.error(f"Parse failed for {db_file.id}: {e}")
        # File is still uploaded, parsing just failed
        pass

    return {
        "id": db_file.id,
        "original_name": db_file.original_name,
        "size": db_file.size,
        "status": db_file.status,
        "mime_type": db_file.mime_type,
    }


@router.get("/{file_id}")
async def get_file(
    file_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(File).where(File.id == file_id, File.user_id == user.id)
    )
    file = result.scalar_one_or_none()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Read extracted text preview if available
    extracted_text = None
    if file.extracted_text_path and os.path.exists(file.extracted_text_path):
        with open(file.extracted_text_path, "r", encoding="utf-8", errors="replace") as f:
            extracted_text = f.read()[:5000]  # preview only

    return {
        "id": file.id,
        "original_name": file.original_name,
        "mime_type": file.mime_type,
        "size": file.size,
        "status": file.status,
        "created_at": file.created_at.isoformat() if file.created_at else None,
        "extracted_text_preview": extracted_text,
    }


@router.delete("/{file_id}")
async def delete_file(
    file_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(File).where(File.id == file_id, File.user_id == user.id)
    )
    file = result.scalar_one_or_none()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Delete from disk
    if os.path.exists(file.storage_path):
        os.remove(file.storage_path)
    if file.extracted_text_path and os.path.exists(file.extracted_text_path):
        os.remove(file.extracted_text_path)

    await db.delete(file)
    await db.commit()
    return {"status": "deleted"}
