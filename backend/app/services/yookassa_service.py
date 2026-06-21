"""YooKassa payment service."""
import uuid
import logging
from datetime import datetime, timedelta, timezone
from typing import Any

from yookassa import Configuration, Payment as YooPayment
from yookassa.domain.models.currency import Currency
from yookassa.domain.response import PaymentResponse

from app.core.config import settings

logger = logging.getLogger(__name__)


def configure_yookassa() -> None:
    """Configure YooKassa SDK with credentials from settings."""
    Configuration.configure(
        account_id=settings.yookassa_shop_id,
        secret_key=settings.yookassa_secret_key,
    )


def create_payment(
    amount: float,
    description: str,
    return_url: str | None = None,
    metadata: dict[str, str] | None = None,
) -> tuple[str, str]:
    """
    Create a YooKassa payment and return (payment_id, confirmation_url).

    Args:
        amount: Payment amount in RUB.
        description: Payment description shown to the user.
        return_url: URL to redirect after payment (falls back to config).
        metadata: Arbitrary key-value data.

    Returns:
        Tuple of (payment_id, confirmation_url).
    """
    configure_yookassa()

    if not return_url:
        return_url = settings.yookassa_return_url

    idempotence_key = str(uuid.uuid4())

    payment: PaymentResponse = YooPayment.create({
        "amount": {
            "value": f"{amount:.2f}",
            "currency": Currency.RUB,
        },
        "confirmation": {
            "type": "redirect",
            "return_url": return_url,
        },
        "capture": True,
        "description": description,
        "metadata": metadata or {},
    }, idempotence_key)

    payment_id = payment.id
    confirmation_url = payment.confirmation.confirmation_url

    logger.info(
        "YooKassa payment created: id=%s, amount=%.2f, description='%s'",
        payment_id, amount, description,
    )

    return payment_id, confirmation_url


def get_payment_status(payment_id: str) -> str | None:
    """
    Get current payment status from YooKassa.

    Returns: 'pending', 'waiting_for_capture', 'succeeded', 'canceled', or None on error.
    """
    try:
        configure_yookassa()
        payment = YooPayment.find_one(payment_id)
        return payment.status
    except Exception as e:
        logger.error("Failed to get payment status for %s: %s", payment_id, e)
        return None


def process_webhook(event: dict[str, Any]) -> dict[str, Any]:
    """
    Process a YooKassa webhook notification.

    Returns a dict with:
        - event: 'payment.succeeded' or 'payment.canceled' or 'payment.waiting_for_capture'
        - payment_id: str
        - metadata: dict
        - status: str
    """
    event_type = event.get("event", "")
    obj = event.get("object", {})

    payment_id = obj.get("id", "")
    status = obj.get("status", "")
    metadata = obj.get("metadata", {})

    logger.info(
        "YooKassa webhook received: event=%s, payment=%s, status=%s",
        event_type, payment_id, status,
    )

    return {
        "event": event_type,
        "payment_id": payment_id,
        "metadata": metadata,
        "status": status,
    }


def calculate_expiry(plan_months: int = 1) -> datetime:
    """Calculate subscription expiry date based on plan duration."""
    return datetime.now(timezone.utc) + timedelta(days=30 * plan_months)
