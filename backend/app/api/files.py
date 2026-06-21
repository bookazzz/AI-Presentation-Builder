"""Files endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/upload")
async def upload_file():
    return {"message": "Not implemented"}


@router.get("/{file_id}")
async def get_file(file_id: str):
    return {"message": "Not implemented", "file_id": file_id}


@router.delete("/{file_id}")
async def delete_file(file_id: str):
    return {"message": "Not implemented", "file_id": file_id}
