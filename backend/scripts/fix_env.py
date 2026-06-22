#!/usr/bin/env python3
"""Generate a clean .env for dev."""
import os

content = f"""# Backend
APP_NAME=AI Presentation Builder
APP_VERSION=0.1.0
DEBUG=true

# Database
DATABASE_URL=sqlite+aiosqlite:///./test.db

# Redis
REDIS_URL=redis://localhost:6379/0

# JWT (defaults: secret_key=change-me-in-production, jwt_algorithm=HS256, access_token_expire_minutes=1440)
SECRET_KEY=dev-se...n
# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=20
EXPORT_DIR=./exports

# YooKassa (set real credentials for production)
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=

# LLM
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-pla...n
# CORS
CORS_ORIGINS=["http://localhost:3000","https://bookazzz.github.io"]
"""

path = "/root/AI-Presentation-Builder/backend/.env"
with open(path, 'w') as f:
    f.write(content)
print(f"Done - {len(content)} bytes")

# Verify it parses correctly
os.chdir("/root/AI-Presentation-Builder/backend")
os.environ['DATABASE_URL'] = 'sqlite+aiosqlite:///./test.db'
from app.core.config import Settings
s = Settings()
print(f"  DB: {s.database_url}")
print(f"  YooKassa: shop={s.yookassa_shop_id!r} key={'set' if s.yookassa_secret_key else 'empty'}")
