"""Tests for configuration module."""
import pytest
from unittest.mock import patch
import json


class TestSettings:
    """Tests for Settings class."""

    def test_cors_origins_list_parsing(self):
        """Should parse CORS origins from JSON string."""
        from app.config import Settings

        with patch.dict("os.environ", {
            "DATABASE_URL": "postgresql+asyncpg://test:test@localhost/test",
            "CORS_ORIGINS": '["http://localhost:3000", "http://localhost:5173"]'
        }):
            settings = Settings()
            origins = settings.cors_origins_list

            assert isinstance(origins, list)
            assert "http://localhost:3000" in origins
            assert "http://localhost:5173" in origins

    def test_is_production_false_by_default(self):
        """Should return False for development environment."""
        from app.config import Settings

        with patch.dict("os.environ", {
            "DATABASE_URL": "postgresql+asyncpg://test:test@localhost/test",
            "ENVIRONMENT": "development"
        }):
            settings = Settings()
            assert settings.is_production is False

    def test_is_production_true_for_production(self):
        """Should return True for production environment."""
        from app.config import Settings

        with patch.dict("os.environ", {
            "DATABASE_URL": "postgresql+asyncpg://test:test@localhost/test",
            "ENVIRONMENT": "production"
        }):
            settings = Settings()
            assert settings.is_production is True

    def test_default_values(self):
        """Should have correct default values."""
        from app.config import Settings

        with patch.dict("os.environ", {
            "DATABASE_URL": "postgresql+asyncpg://test:test@localhost/test"
        }):
            settings = Settings()

            assert settings.llm_provider == "ollama"
            assert settings.embedding_provider == "ollama"
            assert settings.default_city == "bangalore"
            assert settings.ollama_embed_model == "nomic-embed-text"
            assert settings.ollama_llm_model == "llama3.2"

    def test_get_settings_returns_settings(self):
        """Should return Settings instance."""
        from app.config import get_settings

        # Clear cached settings
        get_settings.cache_clear()

        with patch.dict("os.environ", {
            "DATABASE_URL": "postgresql+asyncpg://test:test@localhost/test"
        }):
            settings = get_settings()
            assert settings is not None
            assert hasattr(settings, "database_url")

        get_settings.cache_clear()
