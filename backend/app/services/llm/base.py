"""Abstract LLM provider interface."""

from typing import Optional


class LLMProvider:
    """Abstract interface for LLM providers."""

    async def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4000,
    ) -> str:
        """Send a chat request and return the response text."""
        raise NotImplementedError

    async def chat_json(
        self,
        system_prompt: str,
        user_prompt: str,
        model: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 4000,
    ) -> dict:
        """Send a chat request and parse JSON response."""
        text = await self.chat(system_prompt, user_prompt, model, temperature, max_tokens)
        import json
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        return json.loads(text)
