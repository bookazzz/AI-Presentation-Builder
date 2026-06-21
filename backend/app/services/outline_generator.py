"""Presentation outline generator — uses LLM to propose slide structure."""

import json
import logging
from typing import Optional

from app.services.llm import get_llm_provider, LLMProvider
from app.services.llm.openai_provider import LLMNotAvailable

logger = logging.getLogger(__name__)

# System prompt for outline generation
OUTLINE_SYSTEM_PROMPT = """Ты — эксперт по созданию бизнес-презентаций. Твоя задача — проанализировать исходный материал и предложить структуру презентации.

Правила:
1. Определи тип презентации (бизнес-презентация, отчёт, pitch deck, коммерческое предложение, обучение, продуктовая)
2. Предложи структуру из 6-15 слайдов (в зависимости от объёма материала)
3. Для Excel-данных обязательно включи слайды с графиками и аналитикой
4. Каждый слайд должен иметь:
   - заголовок (до 90 символов)
   - тип (cover, problem, solution, thesis, chart, kpi, table, timeline, comparison, advantages, выводы, cta)
   - краткое описание что будет на слайде (1-2 предложения)
5. Структура должна быть логичной: введение → контекст → основная часть → данные → выводы → CTA

Ответ верни ТОЛЬКО в формате JSON без markdown-обёртки:
{
  "title": "Название презентации",
  "type": "тип презентации",
  "language": "ru",
  "total_slides": 8,
  "outline": [
    {
      "slide_number": 1,
      "type": "cover",
      "title": "Заголовок",
      "description": "Описание"
    }
  ]
}"""


class OutlineGenerator:
    """Generates presentation outline from source content."""

    def __init__(self, llm: Optional[LLMProvider] = None):
        self.llm = llm or get_llm_provider()

    async def generate(
        self,
        source_text: str,
        content_type: str = "text",
        presentation_type: Optional[str] = None,
        audience: Optional[str] = None,
        style: Optional[str] = None,
        language: str = "ru",
        target_slides: int = 8,
        sheets_data: Optional[list] = None,
        insights: Optional[list] = None,
    ) -> dict:
        """Generate a presentation outline from source content."""
        user_prompt = self._build_prompt(
            source_text=source_text,
            content_type=content_type,
            presentation_type=presentation_type,
            audience=audience,
            style=style,
            language=language,
            target_slides=target_slides,
            sheets_data=sheets_data,
            insights=insights,
        )

        try:
            result = await self.llm.chat_json(
                system_prompt=OUTLINE_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.3,
                max_tokens=4000,
            )
            # Validate structure
            if not result.get("outline"):
                raise ValueError("LLM returned empty outline")
            result["source_content_type"] = content_type
            result["language"] = language
            return result
        except LLMNotAvailable:
            logger.info("LLM not available, using template fallback")
            return self._fallback_outline(source_text, content_type, target_slides)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM outline response: {e}")
            return self._fallback_outline(source_text, content_type, target_slides)
        except Exception as e:
            logger.error(f"Outline generation failed: {e}")
            return self._fallback_outline(source_text, content_type, target_slides)

    def _build_prompt(
        self,
        source_text: str,
        content_type: str,
        presentation_type: Optional[str],
        audience: Optional[str],
        style: Optional[str],
        language: str,
        target_slides: int,
        sheets_data: Optional[list],
        insights: Optional[list],
    ) -> str:
        parts = [f"Язык презентации: {language}"]
        parts.append(f"Тип содержимого: {content_type}")
        parts.append(f"Желаемое количество слайдов: {target_slides}")

        if presentation_type:
            parts.append(f"Тип презентации: {presentation_type}")
        if audience:
            parts.append(f"Целевая аудитория: {audience}")
        if style:
            parts.append(f"Стиль оформления: {style}")

        # Truncate source text if too long
        max_text_len = 15000
        text = source_text[:max_text_len]
        if len(source_text) > max_text_len:
            text += "\n\n[Текст обрезан, полная версия в загруженном файле]"
        parts.append(f"\nИсходный материал:\n{text}")

        # Add Excel data insights
        if insights:
            parts.append(f"\nАвтоматические выводы по данным:\n" + "\n".join(f"- {i}" for i in insights[:10]))

        if sheets_data:
            sheets_summary = []
            for s in sheets_data[:5]:
                sheets_summary.append(
                    f"Лист «{s.get('name', '?')}»: "
                    f"{s.get('rows', 0)} строк × {s.get('cols', 0)} столбцов, "
                    f"числовые: {s.get('numeric_cols', [])[:5]}"
                )
            if sheets_summary:
                parts.append(f"\nИнформация о листах Excel:\n" + "\n".join(sheets_summary))

        return "\n".join(parts)

    def _fallback_outline(self, source_text: str, content_type: str, target_slides: int) -> dict:
        """Fallback outline when LLM fails."""
        title = source_text.split("\n")[0][:80] if source_text.strip() else "Презентация"
        slides = [
            {"slide_number": 1, "type": "cover", "title": title, "description": "Титульный слайд"},
            {"slide_number": 2, "type": "thesis", "title": "Основные тезисы", "description": "Ключевые выводы"},
        ]
        if content_type == "excel":
            slides.append({"slide_number": 3, "type": "chart", "title": "Динамика показателей", "description": "График"})
            slides.append({"slide_number": 4, "type": "kpi", "title": "Ключевые показатели", "description": "KPI"})
        slides.append({"slide_number": len(slides) + 1, "type": "conclusions", "title": "Выводы", "description": "Итоги"})
        slides.append({"slide_number": len(slides) + 1, "type": "cta", "title": "Следующие шаги", "description": "Действия"})

        return {
            "title": title,
            "type": "business",
            "language": "ru",
            "total_slides": len(slides),
            "outline": slides,
            "source_content_type": content_type,
        }
