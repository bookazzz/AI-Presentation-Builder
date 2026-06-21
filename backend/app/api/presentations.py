"""Presentations endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.post("")
async def create_presentation():
    return {"message": "Not implemented"}


@router.get("")
async def list_presentations():
    return {"message": "Not implemented"}


@router.get("/{presentation_id}")
async def get_presentation(presentation_id: str):
    return {"message": "Not implemented", "presentation_id": presentation_id}


@router.patch("/{presentation_id}")
async def update_presentation(presentation_id: str):
    return {"message": "Not implemented", "presentation_id": presentation_id}


@router.delete("/{presentation_id}")
async def delete_presentation(presentation_id: str):
    return {"message": "Not implemented", "presentation_id": presentation_id}


@router.post("/{presentation_id}/generate-outline")
async def generate_outline(presentation_id: str):
    return {"message": "Not implemented", "presentation_id": presentation_id}


@router.post("/{presentation_id}/generate-slides")
async def generate_slides(presentation_id: str):
    return {"message": "Not implemented", "presentation_id": presentation_id}


@router.post("/{presentation_id}/regenerate-slide/{slide_id}")
async def regenerate_slide(presentation_id: str, slide_id: int):
    return {"message": "Not implemented", "presentation_id": presentation_id, "slide_id": slide_id}
