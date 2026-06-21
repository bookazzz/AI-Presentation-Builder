"""OpenAI-compatible LLM provider with fallback for missing API key."""

import logging
from typing import Optional

from openai import AsyncOpenAI, APIError

from app.core.config import settings
from .base import LLMProvider

logger = logging.getLogger(__name__)


class OpenAIProvider(LLMProvider):
    """OpenAI / OpenRouter / any OpenAI-compatible API."""

    def __init__(self):
        self.api_key = (settings.openai_api_key or settings.llm_api_key or "").strip()
        self.api_base = settings.llm_api_base or "https://api.openai.com/v1"
        self.default_model = settings.llm_model or "gpt-4o-mini"
        self._client = None

    @property
    def client(self) -> AsyncOpenAI:
        if self._client is None:
            self._client = AsyncOpenAI(
                api_key=self.api_key,
                base_url=self.api_base,
            )
        return self._client

    def is_available(self) -> bool:
        """Check if LLM provider is configured and usable."""
        return bool(self.api_key) and not self.api_key.startswith("sk-place")

    async def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4000,
    ) -> str:
        if not self.is_available():
            raise LLMNotAvailable("LLM API key not configured")

        model_name = model or self.default_model
        try:
            response = await self.client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=temperature,
                max_tokens=max_tokens,
            )
            text = response.choices[0].message.content or ""
            logger.info(f"LLM call: model={model_name}, "
                        f"prompt_tokens={response.usage.prompt_tokens if response.usage else 0}, "
                        f"completion_tokens={response.usage.completion_tokens if response.usage else 0}")
            return text
        except APIError as e:
            logger.error(f"LLM API error: {e.status_code} - {e.message}")
            raise LLMNotAvailable(f"API error: {e.message}")
        except Exception as e:
            logger.error(f"LLM call failed: {e}")
            raise LLMNotAvailable(f"LLM call failed: {e}")


class LLMNotAvailable(Exception):
    """Raised when LLM provider is not configured or failed."""
    pass


def get_llm_provider() -> OpenAIProvider:
    """Get the configured LLM provider."""
    return OpenAIProvider()
