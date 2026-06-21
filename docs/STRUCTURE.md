# docs/TECHNICAL_SPECIFICATION.md — Техническое задание

Ссылка: https://github.com/bookazzz/AI-Presentation-Builder
Лучше читать оригинал в README.md, а полное ТЗ хранить в отдельном документе.

## Структура backend

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI entry point
│   ├── api/                 # Route handlers
│   │   ├── auth.py          # Регистрация, логин, восстановление пароля
│   │   ├── files.py         # Загрузка/удаление файлов
│   │   ├── presentations.py # CRUD презентаций, генерация
│   │   ├── exports.py       # Экспорт PPTX/PDF
│   │   ├── billing.py       # Тарифы, платежи
│   │   └── admin.py         # Админка
│   ├── core/
│   │   ├── config.py        # Pydantic settings
│   │   ├── database.py      # SQLAlchemy async engine + Base
│   │   ├── security.py      # JWT tokens, password hashing
│   │   └── celery_app.py    # Celery config
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   │   ├── llm_service.py   # Abstract LLM provider
│   │   ├── file_parser.py   # TXT/DOCX/XLSX/CSV/PDF parser
│   │   ├── excel_analyzer.py# Excel analysis, charts
│   │   ├── pptx_renderer.py # PPTX generation from JSON
│   │   ├── pdf_renderer.py  # PDF generation
│   │   └── tasks.py         # Celery async tasks
│   └── templates/           # Presentation templates (JSON)
├── alembic/                 # DB migrations
├── alembic.ini
├── requirements.txt
├── Dockerfile
└── .env.example

frontend/
├── src/
│   ├── app/                 # Pages (Next.js App Router)
│   ├── components/          # UI components
│   ├── lib/                 # API client, utils
│   ├── store/               # Zustand stores
│   └── styles/              # Tailwind config
├── package.json
├── next.config.js
└── tsconfig.json
```
