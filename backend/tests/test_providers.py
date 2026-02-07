"""Tests for provider modules."""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock
import httpx

from app.providers.embeddings import (
    OllamaEmbeddingProvider,
    JinaEmbeddingProvider,
    NoOpEmbeddingProvider,
    get_embedding_provider,
    EMBEDDING_DIMENSIONS,
)
from app.providers.llm import (
    OllamaProvider,
    GroqProvider,
    get_llm_provider,
)
from app.core.exceptions import EmbeddingError, LLMError


class TestOllamaEmbeddingProvider:
    """Tests for Ollama embedding provider."""

    def test_dimensions(self):
        """Should return correct dimensions."""
        provider = OllamaEmbeddingProvider()
        assert provider.dimensions == 768

    @pytest.mark.asyncio
    async def test_embed_success(self):
        """Should return embedding on success."""
        provider = OllamaEmbeddingProvider()

        with patch("ollama.embed") as mock_embed:
            mock_embed.return_value = {"embeddings": [[0.1] * 768]}
            result = await provider.embed("test text")

        assert len(result) == 768
        assert result == [0.1] * 768

    @pytest.mark.asyncio
    async def test_embed_empty_text(self):
        """Should return zeros for empty text."""
        provider = OllamaEmbeddingProvider()
        result = await provider.embed("")

        assert len(result) == 768
        assert all(v == 0.0 for v in result)

    @pytest.mark.asyncio
    async def test_embed_whitespace_text(self):
        """Should return zeros for whitespace-only text."""
        provider = OllamaEmbeddingProvider()
        result = await provider.embed("   ")

        assert len(result) == 768
        assert all(v == 0.0 for v in result)

    @pytest.mark.asyncio
    async def test_embed_response_error(self):
        """Should raise EmbeddingError on Ollama error."""
        provider = OllamaEmbeddingProvider()

        with patch("ollama.embed") as mock_embed:
            from ollama import ResponseError
            mock_embed.side_effect = ResponseError("Model not found")

            with pytest.raises(EmbeddingError) as exc_info:
                await provider.embed("test")

            assert "unavailable" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_embed_connection_error(self):
        """Should raise EmbeddingError on connection error."""
        provider = OllamaEmbeddingProvider()

        with patch("ollama.embed") as mock_embed:
            mock_embed.side_effect = ConnectionError("Connection refused")

            with pytest.raises(EmbeddingError) as exc_info:
                await provider.embed("test")

            assert "connect" in str(exc_info.value).lower()


class TestJinaEmbeddingProvider:
    """Tests for Jina AI embedding provider."""

    def test_dimensions(self):
        """Should return correct dimensions."""
        provider = JinaEmbeddingProvider()
        assert provider.dimensions == 768

    @pytest.mark.asyncio
    async def test_embed_empty_text(self):
        """Should return zeros for empty text."""
        provider = JinaEmbeddingProvider()
        result = await provider.embed("")

        assert len(result) == 768
        assert all(v == 0.0 for v in result)

    @pytest.mark.asyncio
    async def test_embed_success(self):
        """Should return embedding on success."""
        provider = JinaEmbeddingProvider()

        mock_response = MagicMock()
        mock_response.json.return_value = {"data": [{"embedding": [0.2] * 768}]}
        mock_response.raise_for_status = MagicMock()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )
            result = await provider.embed("test text")

        assert len(result) == 768

    @pytest.mark.asyncio
    async def test_embed_http_error(self):
        """Should raise EmbeddingError on HTTP error."""
        provider = JinaEmbeddingProvider()

        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = "Unauthorized"

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                side_effect=httpx.HTTPStatusError(
                    "Unauthorized",
                    request=MagicMock(),
                    response=mock_response
                )
            )
            with pytest.raises(EmbeddingError):
                await provider.embed("test")

    @pytest.mark.asyncio
    async def test_embed_connection_error(self):
        """Should raise EmbeddingError on connection error."""
        provider = JinaEmbeddingProvider()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                side_effect=httpx.RequestError("Connection failed")
            )
            with pytest.raises(EmbeddingError) as exc_info:
                await provider.embed("test")

            assert "connect" in str(exc_info.value).lower()

    @pytest.mark.asyncio
    async def test_embed_unexpected_error(self):
        """Should raise EmbeddingError on unexpected error."""
        provider = JinaEmbeddingProvider()

        with patch("httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                side_effect=Exception("Unexpected")
            )
            with pytest.raises(EmbeddingError):
                await provider.embed("test")


class TestNoOpEmbeddingProvider:
    """Tests for NoOp embedding provider."""

    def test_dimensions(self):
        """Should return correct dimensions."""
        provider = NoOpEmbeddingProvider()
        assert provider.dimensions == 768

    @pytest.mark.asyncio
    async def test_embed_returns_zeros(self):
        """Should always return zeros."""
        provider = NoOpEmbeddingProvider()
        result = await provider.embed("any text")

        assert len(result) == 768
        assert all(v == 0.0 for v in result)

    @pytest.mark.asyncio
    async def test_embed_empty_text(self):
        """Should return zeros for empty text."""
        provider = NoOpEmbeddingProvider()
        result = await provider.embed("")

        assert len(result) == 768


class TestGetEmbeddingProvider:
    """Tests for get_embedding_provider factory."""

    def test_returns_ollama_by_default(self):
        """Should return Ollama provider by default."""
        import app.providers.embeddings as emb
        emb._provider = None  # Reset singleton

        with patch.object(emb.settings, "embedding_provider", "ollama"):
            provider = get_embedding_provider()
            assert isinstance(provider, OllamaEmbeddingProvider)

        emb._provider = None  # Reset

    def test_returns_jina_when_configured(self):
        """Should return Jina provider when configured."""
        import app.providers.embeddings as emb
        emb._provider = None

        with patch.object(emb.settings, "embedding_provider", "jina"):
            provider = get_embedding_provider()
            assert isinstance(provider, JinaEmbeddingProvider)

        emb._provider = None

    def test_returns_noop_when_configured(self):
        """Should return NoOp provider when configured."""
        import app.providers.embeddings as emb
        emb._provider = None

        with patch.object(emb.settings, "embedding_provider", "none"):
            provider = get_embedding_provider()
            assert isinstance(provider, NoOpEmbeddingProvider)

        emb._provider = None

    def test_singleton_behavior(self):
        """Should return same instance on repeated calls."""
        import app.providers.embeddings as emb
        emb._provider = None

        with patch.object(emb.settings, "embedding_provider", "ollama"):
            provider1 = get_embedding_provider()
            provider2 = get_embedding_provider()
            assert provider1 is provider2

        emb._provider = None


class TestEmbeddingDimensions:
    """Tests for embedding dimensions constant."""

    def test_dimensions_value(self):
        """Should have correct dimension value."""
        assert EMBEDDING_DIMENSIONS == 768


class TestOllamaLLMProvider:
    """Tests for Ollama LLM provider."""

    @pytest.mark.asyncio
    async def test_chat_success(self):
        """Should return response on success."""
        provider = OllamaProvider()

        with patch("ollama.chat") as mock_chat:
            mock_chat.return_value = {"message": {"content": "parsed result"}}
            result = await provider.chat("system prompt", "user message")

        assert result == "parsed result"
        mock_chat.assert_called_once()

    @pytest.mark.asyncio
    async def test_chat_response_error(self):
        """Should raise LLMError on Ollama error."""
        provider = OllamaProvider()

        with patch("ollama.chat") as mock_chat:
            from ollama import ResponseError
            mock_chat.side_effect = ResponseError("Model error")

            with pytest.raises(LLMError):
                await provider.chat("system", "user")

    @pytest.mark.asyncio
    async def test_chat_connection_error(self):
        """Should raise LLMError on connection error."""
        provider = OllamaProvider()

        with patch("ollama.chat") as mock_chat:
            mock_chat.side_effect = ConnectionError("Connection refused")

            with pytest.raises(LLMError) as exc_info:
                await provider.chat("system", "user")

            assert "connect" in str(exc_info.value).lower()


class TestGroqLLMProvider:
    """Tests for Groq LLM provider."""

    @pytest.mark.asyncio
    async def test_chat_success(self):
        """Should return response on success."""
        with patch("groq.Groq") as mock_groq_class:
            mock_client = MagicMock()
            mock_response = MagicMock()
            mock_response.choices = [MagicMock(message=MagicMock(content="groq response"))]
            mock_client.chat.completions.create.return_value = mock_response
            mock_groq_class.return_value = mock_client

            provider = GroqProvider()
            result = await provider.chat("system", "user")

            assert result == "groq response"

    @pytest.mark.asyncio
    async def test_chat_error(self):
        """Should raise LLMError on Groq error."""
        with patch("groq.Groq") as mock_groq_class:
            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = Exception("API error")
            mock_groq_class.return_value = mock_client

            provider = GroqProvider()

            with pytest.raises(LLMError):
                await provider.chat("system", "user")


class TestGetLLMProvider:
    """Tests for get_llm_provider factory."""

    def test_returns_ollama_by_default(self):
        """Should return Ollama provider by default."""
        import app.providers.llm as llm
        llm._provider = None

        with patch.object(llm.settings, "llm_provider", "ollama"):
            provider = get_llm_provider()
            assert isinstance(provider, OllamaProvider)

        llm._provider = None

    def test_returns_groq_when_configured(self):
        """Should return Groq provider when configured."""
        import app.providers.llm as llm
        llm._provider = None

        with patch.object(llm.settings, "llm_provider", "groq"), \
             patch("groq.Groq"):
            provider = get_llm_provider()
            assert isinstance(provider, GroqProvider)

        llm._provider = None
