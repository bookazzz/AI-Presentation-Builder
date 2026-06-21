"""Billing endpoints — plan listing, YooKassa checkout, webhook, history."""
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.models import User, Plan, Payment
from app.services.yookassa_service import (
    create_payment as yoo_create_payment,
    process_webhook as yoo_process_webhook,
    calculate_expiry,
)

logger = logging.getLogger(__name__)
router = APIRouter()


# ---------- Schemas ----------

from pydantic import BaseModel


class PlanResponse(BaseModel):
    id: str
    name: str
    price: float
    presentations_limit: int
    slides_limit: int
    max_file_size: int
    pptx_export_enabled: bool
    pdf_export_enabled: bool
    watermark_enabled: bool

    model_config = {"from_attributes": True}


class CheckoutRequest(BaseModel):
    plan_id: str


class CheckoutResponse(BaseModel):
    payment_id: str
    confirmation_url: str


class PaymentHistoryItem(BaseModel):
    id: str
    amount: float
    currency: str
    status: str
    provider: str | None
    created_at: datetime | None

    model_config = {"from_attributes": True}


# ---------- Endpoints ----------


@router.get("/plans", response_model=list[PlanResponse])
async def list_plans(db: AsyncSession = Depends(get_db)):
    """List all available plans."""
    result = await db.execute(select(Plan).order_by(Plan.price))
    plans = result.scalars().all()
    return [PlanResponse.model_validate(p) for p in plans]


@router.post("/checkout", response_model=CheckoutResponse)
async def checkout(
    req: CheckoutRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a payment for a plan via YooKassa."""
    # Get plan
    result = await db.execute(select(Plan).where(Plan.id == req.plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    if plan.price <= 0:
        # Free plan — activate immediately
        user.plan_id = plan.id
        user.subscription_status = "active"
        user.plan_expires_at = None
        await db.commit()
        raise HTTPException(
            status_code=400,
            detail="This plan is free. Use the free plan directly.",
        )

    # Create YooKassa payment
    try:
        payment_id, confirmation_url = yoo_create_payment(
            amount=plan.price,
            description=f"Тариф «{plan.name}» — AI Presentation Builder",
            metadata={
                "user_id": user.id,
                "plan_id": plan.id,
            },
        )
    except Exception as e:
        logger.error("Failed to create YooKassa payment: %s", e)
        raise HTTPException(
            status_code=502,
            detail="Payment gateway error. Please try again later.",
        )

    # Save payment record in DB
    payment_record = Payment(
        user_id=user.id,
        plan_id=plan.id,
        amount=plan.price,
        currency="RUB",
        status="pending",
        provider="yookassa",
        provider_payment_id=payment_id,
    )
    db.add(payment_record)
    await db.commit()

    return CheckoutResponse(
        payment_id=payment_id,
        confirmation_url=confirmation_url,
    )


@router.post("/webhook", status_code=200)
async def webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """
    YooKassa webhook endpoint.

    YooKassa sends POST notifications here after payment events.
    This endpoint is public (no auth) — YooKassa signs requests via IP whitelist.
    """
    body = await request.json()
    event_data = yoo_process_webhook(body)

    event = event_data["event"]
    payment_id = event_data["payment_id"]
    status = event_data["status"]
    metadata = event_data["metadata"]

    if event != "payment.succeeded" or status != "succeeded":
        logger.info("Ignoring webhook event: %s (status=%s)", event, status)
        return {"ok": True}

    # Find and update payment record
    result = await db.execute(
        select(Payment).where(Payment.provider_payment_id == payment_id)
    )
    payment_record = result.scalar_one_or_none()
    if not payment_record:
        logger.warning("Payment record not found for YooKassa ID: %s", payment_id)
        return {"ok": True}

    payment_record.status = "succeeded"

    # Activate subscription for user
    user_id = metadata.get("user_id") or payment_record.user_id
    plan_id = metadata.get("plan_id") or payment_record.plan_id

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        result = await db.execute(select(Plan).where(Plan.id == plan_id))
        plan = result.scalar_one_or_none()
        months = 1  # default: 1 month
        user.plan_id = plan_id
        user.subscription_status = "active"
        user.plan_expires_at = calculate_expiry(months)
        logger.info(
            "Subscription activated for user=%s, plan=%s, expires=%s",
            user.id, plan_id, user.plan_expires_at,
        )

    await db.commit()
    return {"ok": True}


@router.get("/history", response_model=list[PaymentHistoryItem])
async def payment_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get payment history for the current user."""
    result = await db.execute(
        select(Payment)
        .where(Payment.user_id == user.id)
        .order_by(desc(Payment.created_at))
    )
    payments = result.scalars().all()
    return [PaymentHistoryItem.model_validate(p) for p in payments]
