"""pytest configuration with async_mode = auto.

Critical: sets DATABASE_URL env var BEFORE any app imports
so the engine is created with the correct in-memory SQLite URL.
"""
import os
import sys

# Force SQLite BEFORE any app imports happen
os.environ["DATABASE_URL"] = "sqlite+aiosqlite://"
os.environ["DATABASE_URL_SYNC"] = "sqlite://"

# Ensure backend is in the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import asyncio
import pytest
from app.core.database import init_db
from app.core.config import settings


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    """Initialize in-memory SQLite DB once per session."""
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(init_db())
    loop.close()
