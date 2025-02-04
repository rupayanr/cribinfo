"""Embedding provider abstraction."""
import logging
from abc import ABC, abstractmethod

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
        if settings.embedding_provider == "none":
            logger.info("Using no-op embedding provider (SQL-only search)")
            _provider = NoOpEmbeddingProvider()
        else:
            logger.info("Using Ollama embedding provider")
            _provider = OllamaEmbeddingProvider()

    return _provider
