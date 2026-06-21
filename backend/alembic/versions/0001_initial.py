"""Initial migration."""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('email', sa.String(255), unique=True, index=True, nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('name', sa.String(255), nullable=True),
        sa.Column('role', sa.String(50), default='user'),
        sa.Column('plan_id', sa.String(36), nullable=True),
        sa.Column('is_blocked', sa.Boolean, default=False),
        sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Plans
    op.create_table(
        'plans',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('price', sa.Float, default=0),
        sa.Column('presentations_limit', sa.Integer, default=3),
        sa.Column('slides_limit', sa.Integer, default=8),
        sa.Column('max_file_size', sa.Integer, default=20),
        sa.Column('pptx_export_enabled', sa.Boolean, default=False),
        sa.Column('pdf_export_enabled', sa.Boolean, default=True),
        sa.Column('watermark_enabled', sa.Boolean, default=True),
        sa.Column('excel_analysis_enabled', sa.Boolean, default=False),
        sa.Column('brand_kit_enabled', sa.Boolean, default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Files
    op.create_table(
        'files',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('original_name', sa.String(500), nullable=False),
        sa.Column('mime_type', sa.String(100), nullable=False),
        sa.Column('size', sa.Integer, nullable=False),
        sa.Column('storage_path', sa.String(1000), nullable=False),
        sa.Column('status', sa.String(50), default='uploaded'),
        sa.Column('extracted_text_path', sa.String(1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Presentations
    op.create_table(
        'presentations',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('title', sa.String(500), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('audience', sa.String(50), nullable=True),
        sa.Column('style', sa.String(50), nullable=True),
        sa.Column('language', sa.String(10), default='ru'),
        sa.Column('status', sa.String(50), default='draft'),
        sa.Column('slides_count', sa.Integer, default=0),
        sa.Column('source_file_id', sa.String(36), sa.ForeignKey('files.id'), nullable=True),
        sa.Column('presentation_json', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Generation tasks
    op.create_table(
        'generation_tasks',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('presentation_id', sa.String(36), sa.ForeignKey('presentations.id'), nullable=False),
        sa.Column('task_type', sa.String(50), nullable=False),
        sa.Column('status', sa.String(50), default='pending'),
        sa.Column('progress', sa.Integer, default=0),
        sa.Column('error_message', sa.Text, nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('finished_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Exports
    op.create_table(
        'exports',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('presentation_id', sa.String(36), sa.ForeignKey('presentations.id'), nullable=False),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('format', sa.String(10), nullable=False),
        sa.Column('file_path', sa.String(1000), nullable=False),
        sa.Column('status', sa.String(50), default='pending'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Payments
    op.create_table(
        'payments',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('plan_id', sa.String(36), sa.ForeignKey('plans.id'), nullable=False),
        sa.Column('amount', sa.Float, nullable=False),
        sa.Column('currency', sa.String(3), default='RUB'),
        sa.Column('status', sa.String(50), default='pending'),
        sa.Column('provider', sa.String(50), nullable=True),
        sa.Column('provider_payment_id', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Usage logs
    op.create_table(
        'usage_logs',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('presentation_id', sa.String(36), sa.ForeignKey('presentations.id'), nullable=True),
        sa.Column('action', sa.String(100), nullable=False),
        sa.Column('tokens_used', sa.Integer, default=0),
        sa.Column('provider', sa.String(50), nullable=True),
        sa.Column('cost', sa.Float, default=0.0),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('usage_logs')
    op.drop_table('payments')
    op.drop_table('exports')
    op.drop_table('generation_tasks')
    op.drop_table('presentations')
    op.drop_table('files')
    op.drop_table('plans')
    op.drop_table('users')
