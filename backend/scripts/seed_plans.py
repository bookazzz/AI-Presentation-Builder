"""Seed plans into the database."""
import asyncio
import os
import sys
import uuid

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.models.models import Plan


PLANS = [
    {
        "name": "Free",
        "price": 0,
        "presentations_limit": 1,
        "slides_limit": 8,
        "max_file_size": 10,
        "pptx_export_enabled": False,
        "pdf_export_enabled": True,
        "watermark_enabled": True,
    },
    {
        "name": "Start",
        "price": 990,
        "presentations_limit": 20,
        "slides_limit": 25,
        "max_file_size": 20,
        "pptx_export_enabled": True,
        "pdf_export_enabled": True,
        "watermark_enabled": False,
    },
    {
        "name": "PRO",
        "price": 2990,
        "presentations_limit": 100,
        "slides_limit": 50,
        "max_file_size": 50,
        "pptx_export_enabled": True,
        "pdf_export_enabled": True,
        "watermark_enabled": False,
    },
    {
        "name": "Business",
        "price": 9900,
        "presentations_limit": 999999,
        "slides_limit": 100,
        "max_file_size": 100,
        "pptx_export_enabled": True,
        "pdf_export_enabled": True,
        "watermark_enabled": False,
    },
]

DATABASE_URL = "sqlite+aiosqlite:///./test.db"


async def seed():
    engine = create_async_engine(DATABASE_URL)
    async with AsyncSession(engine) as session:
        for p in PLANS:
            plan = Plan(
                id=str(uuid.uuid4()),
                name=p["name"],
                price=p["price"],
                presentations_limit=p["presentations_limit"],
                slides_limit=p["slides_limit"],
                max_file_size=p["max_file_size"],
                pptx_export_enabled=p["pptx_export_enabled"],
                pdf_export_enabled=p["pdf_export_enabled"],
                watermark_enabled=p["watermark_enabled"],
            )
            session.add(plan)
        await session.commit()
        print(f"Seeded {len(PLANS)} plans successfully")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(seed())
