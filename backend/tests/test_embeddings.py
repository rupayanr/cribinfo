"""Tests for embeddings module."""
import pytest
from unittest.mock import patch, MagicMock, AsyncMock

from app.core.embeddings import generate_embedding, generate_property_text


class TestGeneratePropertyText:
    """Tests for generate_property_text function."""

    def test_full_property(self):
        """Should generate text with all fields."""
        property_data = {
            "title": "Luxury Apartment",
            "bhk": 3,
            "area": "Koramangala",
            "sqft": 1500,
            "price_lakhs": 150,
            "amenities": ["gym", "pool", "parking"],
        }
        result = generate_property_text(property_data)

        assert "Luxury Apartment" in result
        assert "3 BHK" in result
        assert "in Koramangala" in result
        assert "1500 sqft" in result
        assert "150 lakhs" in result
        assert "amenities: gym, pool, parking" in result

    def test_minimal_property(self):
        """Should handle property with minimal fields."""
        property_data = {"title": "Basic Flat"}
        result = generate_property_text(property_data)

        assert result == "Basic Flat"

    def test_empty_property(self):
        """Should handle empty property."""
        property_data = {}
        result = generate_property_text(property_data)

        assert result == ""

    def test_none_values(self):
        """Should handle None values."""
        property_data = {
            "title": None,
            "bhk": 2,
            "area": None,
        }
        result = generate_property_text(property_data)

        assert "2 BHK" in result
        assert "None" not in result

    def test_empty_amenities(self):
        """Should handle empty amenities list."""
        property_data = {
            "title": "Test",
            "amenities": [],
        }
        result = generate_property_text(property_data)

        assert "amenities" not in result

    def test_only_bhk(self):
        """Should handle property with only BHK."""
        property_data = {"bhk": 2}
        result = generate_property_text(property_data)

        assert result == "2 BHK"

    def test_only_area(self):
        """Should handle property with only area."""
        property_data = {"area": "Whitefield"}
        result = generate_property_text(property_data)

        assert result == "in Whitefield"

    def test_only_sqft(self):
        """Should handle property with only sqft."""
        property_data = {"sqft": 1200}
        result = generate_property_text(property_data)

        assert result == "1200 sqft"

    def test_only_price(self):
        """Should handle property with only price."""
        property_data = {"price_lakhs": 85.5}
        result = generate_property_text(property_data)

        assert result == "85.5 lakhs"


class TestGenerateEmbedding:
    """Tests for generate_embedding function."""

    @pytest.mark.asyncio
    async def test_generate_embedding_success(self):
        """Should generate embedding successfully."""
        mock_provider = MagicMock()
        mock_provider.embed = AsyncMock(return_value=[0.1] * 768)

        with patch("app.core.embeddings.get_embedding_provider", return_value=mock_provider):
            result = await generate_embedding("test text")

        assert len(result) == 768
        mock_provider.embed.assert_called_once_with("test text")

    @pytest.mark.asyncio
    async def test_generate_embedding_calls_provider(self):
        """Should call the embedding provider."""
        mock_provider = MagicMock()
        mock_provider.embed = AsyncMock(return_value=[0.5] * 768)

        with patch("app.core.embeddings.get_embedding_provider", return_value=mock_provider):
            await generate_embedding("hello world")

        mock_provider.embed.assert_called_once_with("hello world")
