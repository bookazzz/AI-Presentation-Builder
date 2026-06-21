"""Auth endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.post("/register")
async def register():
    return {"message": "Not implemented"}


@router.post("/login")
async def login():
    return {"message": "Not implemented"}


@router.post("/logout")
async def logout():
    return {"message": "Not implemented"}


@router.post("/forgot-password")
async def forgot_password():
    return {"message": "Not implemented"}
