"""Exports endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/{presentation_id}/pptx")
async def export_pptx(presentation_id: str):
    return {"message": "Not implemented", "presentation_id": presentation_id}


@router.post("/{presentation_id}/pdf")
async def export_pdf(presentation_id: str):
    return {"message": "Not implemented", "presentation_id": presentation_id}


@router.get("/{export_id}/download")
async def download_export(export_id: str):
    return {"message": "Not implemented", "export_id": export_id}
