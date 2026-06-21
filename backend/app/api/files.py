from fastapi import APIRouter, Depends, HTTPException, UploadFile, File as FastAPIFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.models.models import User, File
import os
import uuid

router = APIRouter()


@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Validate size
    contents = await file.read()
    file_size = len(contents)
    if file_size > settings.max_file_size_mb * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.max_file_size_mb}MB limit")

    # Save file
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_name = f"{uuid.uuid4()}.{ext}"
    upload_path = os.path.join(settings.upload_dir, str(user.id), unique_name)
    os.makedirs(os.path.dirname(upload_path), exist_ok=True)

    with open(upload_path, "wb") as f:
        f.write(contents)

    # Save record
    db_file = File(
        user_id=user.id,
        original_name=file.filename or "unnamed",
        mime_type=file.content_type or "application/octet-stream",
        size=file_size,
        storage_path=upload_path,
    )
    db.add(db_file)
    await db.commit()
    await db.refresh(db_file)

    return {
        "id": db_file.id,
        "original_name": db_file.original_name,
        "size": db_file.size,
        "status": db_file.status,
    }


@router.get("/{file_id}")
async def get_file(file_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(File).where(File.id == file_id, File.user_id == user.id))
    file = result.scalar_one_or_none()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return file


@router.delete("/{file_id}")
async def delete_file(file_id: int, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(File).where(File.id == file_id, File.user_id == user.id))
    file = result.scalar_one_or_none()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")

    # Delete from storage
    if os.path.exists(file.storage_path):
        os.remove(file.storage_path)

    await db.delete(file)
    await db.commit()
    return {"status": "deleted"}
