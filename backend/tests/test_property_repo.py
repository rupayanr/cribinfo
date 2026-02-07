"""Tests for property repository."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import UUID

from app.repositories.property_repo import (
    get_property_by_id,
    get_properties_by_ids,
    get_available_cities,
    get_areas_by_city,
    create_property,
    update_property_embedding,
)


class TestGetPropertyById:
    """Tests for get_property_by_id."""

    @pytest.mark.asyncio
    async def test_property_found(self):
        """Should return property when found."""
        mock_db = AsyncMock()
        mock_property = MagicMock()
        mock_property.id = UUID("12345678-1234-5678-1234-567812345678")

        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_property
        mock_db.execute.return_value = mock_result

        result = await get_property_by_id(mock_db, mock_property.id)

        assert result == mock_property
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_property_not_found(self):
        """Should return None when property not found."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        result = await get_property_by_id(mock_db, UUID("12345678-1234-5678-1234-567812345678"))

        assert result is None


class TestGetPropertiesByIds:
    """Tests for get_properties_by_ids."""

    @pytest.mark.asyncio
    async def test_multiple_properties_found(self):
        """Should return list of properties."""
        mock_db = AsyncMock()
        mock_props = [MagicMock(), MagicMock()]

        mock_scalars = MagicMock()
        mock_scalars.all.return_value = mock_props
        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        ids = [
            UUID("12345678-1234-5678-1234-567812345678"),
            UUID("87654321-4321-8765-4321-876543218765")
        ]
        result = await get_properties_by_ids(mock_db, ids)

        assert len(result) == 2
        assert result == mock_props

    @pytest.mark.asyncio
    async def test_empty_ids_list(self):
        """Should handle empty IDs list."""
        mock_db = AsyncMock()
        mock_scalars = MagicMock()
        mock_scalars.all.return_value = []
        mock_result = MagicMock()
        mock_result.scalars.return_value = mock_scalars
        mock_db.execute.return_value = mock_result

        result = await get_properties_by_ids(mock_db, [])

        assert result == []


class TestGetAvailableCities:
    """Tests for get_available_cities."""

    @pytest.mark.asyncio
    async def test_returns_cities(self):
        """Should return list of cities."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.all.return_value = [("bangalore",), ("delhi",), ("mumbai",)]
        mock_db.execute.return_value = mock_result

        result = await get_available_cities(mock_db)

        assert result == ["bangalore", "delhi", "mumbai"]

    @pytest.mark.asyncio
    async def test_empty_cities(self):
        """Should return empty list when no cities."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.all.return_value = []
        mock_db.execute.return_value = mock_result

        result = await get_available_cities(mock_db)

        assert result == []


class TestGetAreasByCity:
    """Tests for get_areas_by_city."""

    @pytest.mark.asyncio
    async def test_returns_areas(self):
        """Should return list of areas for city."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.all.return_value = [("Koramangala",), ("Whitefield",), ("Indiranagar",)]
        mock_db.execute.return_value = mock_result

        result = await get_areas_by_city(mock_db, "bangalore")

        assert result == ["Koramangala", "Whitefield", "Indiranagar"]

    @pytest.mark.asyncio
    async def test_unknown_city(self):
        """Should return empty list for unknown city."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.all.return_value = []
        mock_db.execute.return_value = mock_result

        result = await get_areas_by_city(mock_db, "unknown_city")

        assert result == []


class TestCreateProperty:
    """Tests for create_property."""

    @pytest.mark.asyncio
    async def test_creates_property(self):
        """Should create and return property."""
        mock_db = AsyncMock()
        property_data = {
            "city": "bangalore",
            "title": "Test Property",
            "area": "Koramangala",
            "bhk": 2,
            "sqft": 1200,
            "price_lakhs": 85.0,
        }

        with patch("app.repositories.property_repo.Property") as MockProperty:
            mock_property = MagicMock()
            MockProperty.return_value = mock_property

            result = await create_property(mock_db, property_data)

            mock_db.add.assert_called_once_with(mock_property)
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once_with(mock_property)
            assert result == mock_property


class TestUpdatePropertyEmbedding:
    """Tests for update_property_embedding."""

    @pytest.mark.asyncio
    async def test_updates_embedding(self):
        """Should update property embedding."""
        mock_db = AsyncMock()
        mock_property = MagicMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = mock_property
        mock_db.execute.return_value = mock_result

        embedding = [0.1] * 768
        property_id = UUID("12345678-1234-5678-1234-567812345678")

        await update_property_embedding(mock_db, property_id, embedding)

        assert mock_property.embedding == embedding
        mock_db.commit.assert_called_once()

    @pytest.mark.asyncio
    async def test_property_not_found(self):
        """Should not update if property not found."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalar_one_or_none.return_value = None
        mock_db.execute.return_value = mock_result

        embedding = [0.1] * 768
        property_id = UUID("12345678-1234-5678-1234-567812345678")

        await update_property_embedding(mock_db, property_id, embedding)

        mock_db.commit.assert_not_called()
