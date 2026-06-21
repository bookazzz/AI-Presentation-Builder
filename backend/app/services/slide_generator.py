"""Slide content generator — fills outline with actual content using LLM."""

import json
import logging
from typing import Optional

from app.services.llm import get_llm_provider, LLMProvider
from app.services.llm.openai_provider import LLMNotAvailable

logger = logging.getLogger(__name__)

CONTENT_SYSTEM_PROMPT = """Ты — эксперт по наполнению бизнес-презентаций. Твоя задача — наполнить слайды качественным контентом на основе утверждённой структуры и исходного материала.

Правила форматирования:
1. Заголовок: до 90 символов
2. Буллеты: 3-6 штук на слайд, каждый до 140 символов
3. Текст должен быть тезисным, без воды
4. Не переноси текст целиком — сжимай до сути
5. Для графиков (chart) укажи тип графика и источник данных
6. Для KPI-слайдов укажи конкретные цифры
7. Все числовые данные бери ТОЛЬКО из исходного материала — не выдумывай
8. Язык презентации: {language}

Ответ верни ТОЛЬКО в формате JSON без markdown-обёртки:
{{
  "title": "Название презентации",
  "language": "{language}",
  "style": "{style}",
  "slides": [
    {{
      "slide_number": 1,
      "type": "cover",
      "title": "Заголовок",
      "subtitle": "Подзаголовок",
      "content": ["Тезис 1", "Тезис 2"],
      "speaker_notes": "Заметки спикера",
      "visual": {{"type": "none"}}
    }}
  ]
}}

Типы визуалов: none, chart, kpi_table, comparison_table, timeline, process, image
Типы графиков (для visual.type='chart'): bar, line, pie, area"""


class SlideGenerator:
    """Fills slide outline with LLM-generated content."""

    def __init__(self, llm: Optional[LLMProvider] = None):
        self.llm = llm or get_llm_provider()

    async def generate(
        self,
        outline: dict,
        source_text: str,
        content_type: str = "text",
        charts_data: Optional[list] = None,
        insights: Optional[list] = None,
        style: str = "business",
        language: str = "ru",
    ) -> dict:
        """Generate slide content from outline and source material."""
        user_prompt = self._build_prompt(
            outline=outline,
            source_text=source_text,
            content_type=content_type,
            charts_data=charts_data,
            insights=insights,
            style=style,
            language=language,
        )

        system_prompt = CONTENT_SYSTEM_PROMPT.format(language=language, style=style)

        try:
            result = await self.llm.chat_json(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                temperature=0.4,
                max_tokens=6000,
            )
            if not result.get("slides"):
                raise ValueError("LLM returned empty slides")
            return result
        except LLMNotAvailable:
            logger.info("LLM not available, using template fallback")
            return self._fallback_slides(outline, language, style)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse LLM slides response: {e}")
            return self._fallback_slides(outline, language, style)
        except Exception as e:
            logger.error(f"Slide generation failed: {e}")
            return self._fallback_slides(outline, language, style)

    def _build_prompt(
        self,
        outline: dict,
        source_text: str,
        content_type: str,
        charts_data: Optional[list],
        insights: Optional[list],
        style: str,
        language: str,
    ) -> str:
        parts = [f"Стиль: {style}"]
        parts.append(f"Тип содержимого: {content_type}")
        parts.append(f"Язык: {language}")

        # Outline
        parts.append("\nУтверждённая структура:")
        for slide in outline.get("outline", []):
            parts.append(
                f"  {slide['slide_number']}. [{slide['type']}] {slide['title']}"
                f" — {slide.get('description', '')}"
            )

        # Source text
        text = source_text[:10000]
        if len(source_text) > 10000:
            text += "\n\n[Текст обрезан]"
        parts.append(f"\nИсходный материал:\n{text}")

        # Chart data
        if charts_data:
            parts.append("\nДанные для графиков:")
            for c in charts_data:
                parts.append(f"  - {c.get('title', 'график')}: тип={c.get('type')}, "
                             f"метки={c.get('labels', [])[:5]}, "
                             f"значения={c.get('values', [])[:5]}")

        # Insights
        if insights:
            parts.append("\nАналитические выводы (использовать на слайдах):")
            for i in insights[:8]:
                parts.append(f"  - {i}")

        return "\n".join(parts)

    def _fallback_slides(self, outline: dict, language: str, style: str) -> dict:
        """Generate basic slides from outline without LLM."""
        slides = []
        for slide in outline.get("outline", []):
            slide_data = {
                "slide_number": slide["slide_number"],
                "type": slide["type"],
                "title": slide["title"],
                "subtitle": "",
                "content": [slide.get("description", "")],
                "speaker_notes": "",
                "visual": {"type": "none"},
            }
            # Assign chart visuals for chart/kpi types
            if slide["type"] in ("chart", "kpi"):
                slide_data["visual"] = {
                    "type": "chart",
                    "chart_type": "bar" if slide["type"] == "chart" else "kpi_table",
                    "title": slide["title"],
                }
            slides.append(slide_data)

        return {
            "title": outline.get("title", "Презентация"),
            "language": language,
            "style": style,
            "slides": slides,
        }
