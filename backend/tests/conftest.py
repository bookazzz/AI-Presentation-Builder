"""pytest configuration with asyncio_mode = auto."""
import pytest
from app.core.database import init_db
from app.core.config import settings


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    """Initialize in-memory SQLite DB once per session."""
    old_url = settings.database_url
    settings.database_url = "sqlite+aiosqlite://"
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(init_db())
    loop.close()
    settings.database_url = old_url
    return
