"""Billing endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/plans")
async def list_plans():
    return {"message": "Not implemented"}


@router.post("/checkout")
async def checkout():
    return {"message": "Not implemented"}


@router.post("/webhook")
async def webhook():
    return {"message": "Not implemented"}


@router.get("/history")
async def payment_history():
    return {"message": "Not implemented"}
