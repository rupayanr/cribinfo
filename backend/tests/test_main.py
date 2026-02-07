"""Tests for main application module."""
import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app


class TestAppLifecycle:
    """Tests for application lifecycle events."""

    @pytest.mark.asyncio
    async def test_startup_event(self):
        """Should log startup message on startup."""
        with patch("app.main.logger") as mock_logger:
            # Trigger the startup event
            for handler in app.router.on_startup:
                await handler()

            mock_logger.info.assert_called_with("CribInfo API starting up...")

    @pytest.mark.asyncio
    async def test_shutdown_event(self):
        """Should log shutdown message on shutdown."""
        with patch("app.main.logger") as mock_logger:
            # Trigger the shutdown event
            for handler in app.router.on_shutdown:
                await handler()

            mock_logger.info.assert_called_with("CribInfo API shutting down...")


class TestAppConfiguration:
    """Tests for application configuration."""

    def test_app_title(self):
        """Should have correct app title."""
        assert app.title == "CribInfo API"

    def test_app_version(self):
        """Should have correct version."""
        assert app.version == "1.0.0"

    def test_exception_handlers_registered(self):
        """Should have exception handlers registered."""
        from app.core.exceptions import CribInfoException
        from pydantic import ValidationError as PydanticValidationError

        # Check that handlers are registered
        assert CribInfoException in app.exception_handlers
        assert PydanticValidationError in app.exception_handlers
        assert Exception in app.exception_handlers

    def test_routes_included(self):
        """Should have API routes included."""
        routes = [route.path for route in app.routes]

        assert "/health" in routes
        assert "/api/v1/search" in routes
        assert "/api/v1/cities" in routes


class TestHealthEndpoint:
    """Tests for health check endpoint."""

    @pytest.mark.asyncio
    async def test_health_returns_healthy(self):
        """Should return healthy status."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}
