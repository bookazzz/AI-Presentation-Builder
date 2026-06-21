"""Celery tasks for presentation generation."""

from app.core.celery_app import celery_app


@celery_app.task(bind=True, max_retries=3)
def parse_file(self, file_id: str):
    """Extract text/data from uploaded file."""
    pass


@celery_app.task(bind=True, max_retries=3)
def analyze_content(self, file_id: str):
    """Analyze extracted content — classify, summarize."""
    pass


@celery_app.task(bind=True, max_retries=3)
def generate_outline(self, presentation_id: str):
    """Generate presentation outline."""
    pass


@celery_app.task(bind=True, max_retries=3)
def generate_slides(self, presentation_id: str):
    """Generate slide content using LLM."""
    pass


@celery_app.task(bind=True, max_retries=3)
def render_pptx(self, presentation_id: str):
    """Render PPTX from JSON structure."""
    pass


@celery_app.task(bind=True, max_retries=3)
def render_pdf(self, presentation_id: str):
    """Render PDF from JSON structure."""
    pass
