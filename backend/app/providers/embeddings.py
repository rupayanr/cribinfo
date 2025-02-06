"""Embedding provider abstraction."""
import logging
from abc import ABC, abstractmethod

import httpx

from app.config import get_settings
from app.core.exceptions import EmbeddingError

settings = get_settings()
logger = logging.getLogger(__name__)

# Standard embedding dimensions
EMBEDDING_DIMENSIONS = 768


class EmbeddingProvider(ABC):
    """Abstract base class for embedding providers."""

    @property
    @abstractmethod
    def dimensions(self) -> int:
        """Return the embedding dimensions."""
        pass

    @abstractmethod
    async def embed(self, text: str) -> list[float]:
        """Generate embedding for text.

        Args:
            text: Text to embed

        Returns:
            List of floats representing the embedding

        Raises:
            EmbeddingError: If embedding generation fails
        """
        pass


class OllamaEmbeddingProvider(EmbeddingProvider):
    """Ollama embedding provider for local development."""

    @property
    def dimensions(self) -> int:
        return 768  # nomic-embed-text dimensions

    async def embed(self, text: str) -> list[float]:
        import ollama
        from ollama import ResponseError

        if not text or not text.strip():
            logger.warning("Empty text provided for embedding")
            return [0.0] * self.dimensions

        try:
            response = ollama.embed(
                model=settings.ollama_embed_model,
                input=text,
            )
            return response["embeddings"][0]
        except ResponseError as e:
            logger.error(f"Ollama embedding error: {e}")
            raise EmbeddingError(f"Embedding service unavailable: {str(e)}")
        except ConnectionError as e:
            logger.error(f"Cannot connect to Ollama: {e}")
            raise EmbeddingError("Cannot connect to embedding service.")


class JinaEmbeddingProvider(EmbeddingProvider):
    """Jina AI embedding provider for production.

    Free tier: 1M tokens/month
    https://jina.ai/embeddings/
    """

    JINA_API_URL = "https://api.jina.ai/v1/embeddings"

    @property
    def dimensions(self) -> int:
        return 768  # jina-embeddings-v3 with 768 dimensions

    async def embed(self, text: str) -> list[float]:
        if not text or not text.strip():
            logger.warning("Empty text provided for embedding")
            return [0.0] * self.dimensions

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.JINA_API_URL,
                    headers={
                        "Authorization": f"Bearer {settings.jina_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "jina-embeddings-v3",
                        "task": "text-matching",
                        "dimensions": 768,
                        "input": [text],
                    },
                    timeout=30.0,
                )
                response.raise_for_status()
                data = response.json()
                return data["data"][0]["embedding"]
        except httpx.HTTPStatusError as e:
            logger.error(f"Jina API error: {e.response.status_code} - {e.response.text}")
            raise EmbeddingError(f"Embedding service error: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Jina connection error: {e}")
            raise EmbeddingError("Cannot connect to embedding service.")
        except Exception as e:
            logger.exception(f"Unexpected Jina error: {e}")
            raise EmbeddingError("Failed to generate embedding")


class NoOpEmbeddingProvider(EmbeddingProvider):
    """No-op embedding provider that returns zeros.

    Used when vector search is disabled in production free tier.
    Search falls back to SQL filters only.
    """

    @property
    def dimensions(self) -> int:
        return 768

    async def embed(self, text: str) -> list[float]:
        logger.debug("Using no-op embedding provider (vector search disabled)")
        return [0.0] * self.dimensions


_provider: EmbeddingProvider | None = None


def get_embedding_provider() -> EmbeddingProvider:
    """Get the configured embedding provider (singleton)."""
    global _provider

    if _provider is None:
        if settings.embedding_provider == "jina":
            logger.info("Using Jina AI embedding provider")
            _provider = JinaEmbeddingProvider()
        elif settings.embedding_provider == "none":
            logger.info("Using no-op embedding provider (SQL-only search)")
            _provider = NoOpEmbeddingProvider()
        else:
            logger.info("Using Ollama embedding provider")
            _provider = OllamaEmbeddingProvider()

    return _provider
