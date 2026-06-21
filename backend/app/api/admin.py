"""Admin endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/users")
async def list_users():
    return {"message": "Not implemented"}


@router.get("/presentations")
async def list_presentations():
    return {"message": "Not implemented"}


@router.get("/plans")
async def list_plans():
    return {"message": "Not implemented"}


@router.get("/logs")
async def list_logs():
    return {"message": "Not implemented"}
