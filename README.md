# AI Presentation Builder

Веб-сервис для создания бизнес-презентаций из текстовых файлов и Excel.

Загрузите текст или Excel — получите готовую презентацию с выводами, графиками и экспортом в PPTX/PDF за несколько минут.

## Возможности

- **Text-to-Presentation** — загрузка TXT/DOCX/PDF или вставка текста вручную
- **Excel-to-Presentation** — анализ таблиц, построение графиков, формирование выводов
- **Умная генерация** — AI-анализ структуры, выделение тезисов, подбор дизайна
- **Редактор** — просмотр и редактирование слайдов в браузере
- **Экспорт** — PPTX и PDF
- **Шаблоны** — 8+ стилей оформления под разные типы презентаций

## Технологический стек

### Backend
- Python + FastAPI
- PostgreSQL
- Redis + Celery
- SQLAlchemy + Alembic
- python-pptx, pandas, plotly

### Frontend
- Next.js + TypeScript
- Tailwind CSS
- Zustand + React Query

## Быстрый старт

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Структура проекта

```
backend/
├── app/
│   ├── api/          # API endpoints
│   ├── core/         # Config, security, dependencies
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── services/     # Business logic
│   └── templates/    # Presentation templates
├── alembic/          # Migrations
└── requirements.txt

frontend/
├── src/
│   ├── app/          # Next.js pages
│   ├── components/   # React components
│   ├── lib/          # API client, utils
│   └── store/        # Zustand stores
└── package.json

docs/                 # Documentation
```

## Roadmap

1. **Прототип** — загрузка TXT, генерация структуры, базовый PPTX
2. **MVP** — регистрация, DOCX/XLSX/CSV, редактор, 8+ шаблонов, PDF, платежи
3. **Excel Analytics** — графики, KPI, автоаналитика
4. **Brand Kit & B2B** — брендбук, командные аккаунты
5. **Интеграции** — Google Slides, CRM, API

## Лицензия

MIT
