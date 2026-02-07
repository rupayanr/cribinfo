"""Tests for error handlers."""
import pytest
from unittest.mock import MagicMock, AsyncMock
from fastapi import Request
from pydantic import ValidationError, BaseModel

from app.core.error_handlers import (
    cribinfo_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from app.core.exceptions import (
    CribInfoException,
    DatabaseError,
    LLMError,
    EmbeddingError,
    ValidationError as CribValidationError,
    NotFoundError,
    RateLimitError,
)


class TestCribInfoExceptionHandler:
    """Tests for custom exception handler."""

    @pytest.mark.asyncio
    async def test_handles_database_error(self):
        """Should handle DatabaseError correctly."""
        mock_request = MagicMock(spec=Request)
        exc = DatabaseError("Database connection failed")

        response = await cribinfo_exception_handler(mock_request, exc)

        assert response.status_code == 503
        body = response.body.decode()
        assert "Database connection failed" in body
        assert "DatabaseError" in body

    @pytest.mark.asyncio
    async def test_handles_llm_error(self):
        """Should handle LLMError correctly."""
        mock_request = MagicMock(spec=Request)
        exc = LLMError("LLM service unavailable")

        response = await cribinfo_exception_handler(mock_request, exc)

        assert response.status_code == 503
        body = response.body.decode()
        assert "LLM service unavailable" in body

    @pytest.mark.asyncio
    async def test_handles_embedding_error(self):
        """Should handle EmbeddingError correctly."""
        mock_request = MagicMock(spec=Request)
        exc = EmbeddingError("Embedding service failed")

        response = await cribinfo_exception_handler(mock_request, exc)

        assert response.status_code == 503
        body = response.body.decode()
        assert "Embedding service failed" in body

    @pytest.mark.asyncio
    async def test_handles_not_found_error(self):
        """Should handle NotFoundError correctly."""
        mock_request = MagicMock(spec=Request)
        exc = NotFoundError("Property not found")

        response = await cribinfo_exception_handler(mock_request, exc)

        assert response.status_code == 404
        body = response.body.decode()
        assert "Property not found" in body

    @pytest.mark.asyncio
    async def test_handles_rate_limit_error(self):
        """Should handle RateLimitError correctly."""
        mock_request = MagicMock(spec=Request)
        exc = RateLimitError()

        response = await cribinfo_exception_handler(mock_request, exc)

        assert response.status_code == 429
        body = response.body.decode()
        assert "Too many requests" in body

    @pytest.mark.asyncio
    async def test_handles_validation_error(self):
        """Should handle custom ValidationError correctly."""
        mock_request = MagicMock(spec=Request)
        exc = CribValidationError("Invalid input")

        response = await cribinfo_exception_handler(mock_request, exc)

        assert response.status_code == 400
        body = response.body.decode()
        assert "Invalid input" in body


class TestValidationExceptionHandler:
    """Tests for Pydantic validation error handler."""

    @pytest.mark.asyncio
    async def test_handles_pydantic_validation_error(self):
        """Should handle Pydantic ValidationError correctly."""
        mock_request = MagicMock(spec=Request)

        # Create a real Pydantic validation error
        class TestModel(BaseModel):
            name: str
            age: int

        try:
            TestModel(name=123, age="not a number")
        except ValidationError as exc:
            response = await validation_exception_handler(mock_request, exc)

            assert response.status_code == 400
            body = response.body.decode()
            assert "Invalid input" in body
            assert "ValidationError" in body


class TestGenericExceptionHandler:
    """Tests for generic exception handler."""

    @pytest.mark.asyncio
    async def test_handles_generic_exception(self):
        """Should handle unexpected exceptions."""
        mock_request = MagicMock(spec=Request)
        exc = Exception("Unexpected error")

        response = await generic_exception_handler(mock_request, exc)

        assert response.status_code == 500
        body = response.body.decode()
        assert "unexpected error occurred" in body.lower()
        assert "InternalServerError" in body

    @pytest.mark.asyncio
    async def test_handles_runtime_error(self):
        """Should handle RuntimeError."""
        mock_request = MagicMock(spec=Request)
        exc = RuntimeError("Something went wrong")

        response = await generic_exception_handler(mock_request, exc)

        assert response.status_code == 500

    @pytest.mark.asyncio
    async def test_handles_value_error(self):
        """Should handle ValueError."""
        mock_request = MagicMock(spec=Request)
        exc = ValueError("Invalid value")

        response = await generic_exception_handler(mock_request, exc)

        assert response.status_code == 500
