"""add subscription fields to user

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-21
"""
from alembic import op
import sqlalchemy as sa
from datetime import timezone

revision = "0002"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("subscription_status", sa.String(20), server_default="free", nullable=False))
    op.add_column("users", sa.Column("plan_expires_at", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "plan_expires_at")
    op.drop_column("users", "subscription_status")
