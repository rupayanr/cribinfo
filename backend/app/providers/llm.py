"""LLM provider abstraction for query parsing."""
import logging
from abc import ABC, abstractmethod

from app.config import get_settings
from app.core.exceptions import LLMError

settings = get_settings()
logger = logging.getLogger(__name__)


class LLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    async def chat(self, system_prompt: str, user_message: str) -> str:
        """Send a chat completion request.

        Args:
            system_prompt: System instructions
            user_message: User's query

        Returns:
            LLM response text

        Raises:
            LLMError: If the request fails
        """
        pass


class OllamaProvider(LLMProvider):
    """Ollama LLM provider for local development."""

    async def chat(self, system_prompt: str, user_message: str) -> str:
        import ollama
        from ollama import ResponseError

        try:
            response = ollama.chat(
                model=settings.ollama_llm_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                options={"temperature": 0},
            )
            return response["message"]["content"]
        except ResponseError as e:
            logger.error(f"Ollama LLM error: {e}")
            raise LLMError(f"Query parsing service unavailable: {str(e)}")
        except ConnectionError as e:
            logger.error(f"Cannot connect to Ollama: {e}")
            raise LLMError("Cannot connect to AI service. Please try again later.")


class GroqProvider(LLMProvider):
    """Groq LLM provider for production."""

    def __init__(self):
        from groq import Groq

        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model

    async def chat(self, system_prompt: str, user_message: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message},
                ],
                temperature=0,
                max_tokens=500,
            )
            return response.choices[0].message.content
        except Exception as e:
            logger.error(f"Groq LLM error: {e}")
            raise LLMError(f"Query parsing service unavailable: {str(e)}")


_provider: LLMProvider | None = None


def get_llm_provider() -> LLMProvider:
    """Get the configured LLM provider (singleton)."""
    global _provider

    if _provider is None:
        if settings.llm_provider == "groq":
            logger.info("Using Groq LLM provider")
            _provider = GroqProvider()
        else:
            logger.info("Using Ollama LLM provider")
            _provider = OllamaProvider()

    return _provider
