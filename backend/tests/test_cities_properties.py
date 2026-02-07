"""Tests for cities and properties endpoints."""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport
from uuid import UUID

from app.main import app


class TestCitiesEndpoint:
    """Tests for cities endpoint."""

    @pytest.mark.asyncio
    async def test_list_cities_success(self):
        """Should return list of available cities."""
        with patch("app.api.routes.cities.get_available_cities", new_callable=AsyncMock) as mock_get_cities:
            mock_get_cities.return_value = ["bangalore", "delhi", "mumbai"]

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.get("/api/v1/cities")

        assert response.status_code == 200
        data = response.json()
        assert "cities" in data
        assert data["cities"] == ["bangalore", "delhi", "mumbai"]

    @pytest.mark.asyncio
    async def test_list_cities_empty(self):
        """Should return empty list when no cities."""
        with patch("app.api.routes.cities.get_available_cities", new_callable=AsyncMock) as mock_get_cities:
            mock_get_cities.return_value = []

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.get("/api/v1/cities")

        assert response.status_code == 200
        data = response.json()
        assert data["cities"] == []


class TestAreasEndpoint:
    """Tests for city areas endpoint."""

    @pytest.mark.asyncio
    async def test_list_areas_success(self):
        """Should return list of areas for a city."""
        with patch("app.api.routes.cities.get_areas_by_city", new_callable=AsyncMock) as mock_get_areas:
            mock_get_areas.return_value = ["Koramangala", "Whitefield", "Indiranagar"]

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.get("/api/v1/cities/bangalore/areas")

        assert response.status_code == 200
        data = response.json()
        assert data["city"] == "bangalore"
        assert "areas" in data
        assert len(data["areas"]) == 3

    @pytest.mark.asyncio
    async def test_list_areas_unknown_city(self):
        """Should return empty areas for unknown city."""
        with patch("app.api.routes.cities.get_areas_by_city", new_callable=AsyncMock) as mock_get_areas:
            mock_get_areas.return_value = []

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.get("/api/v1/cities/unknown/areas")

        assert response.status_code == 200
        data = response.json()
        assert data["city"] == "unknown"
        assert data["areas"] == []


class TestPropertiesEndpoint:
    """Tests for properties endpoint."""

    @pytest.mark.asyncio
    async def test_get_property_success(self):
        """Should return property by ID."""
        mock_property = MagicMock()
        mock_property.to_dict.return_value = {
            "id": "12345678-1234-5678-1234-567812345678",
            "city": "bangalore",
            "title": "Test Property",
            "area": "Whitefield",
            "bhk": 2,
            "sqft": 1200,
            "bathrooms": 2,
            "price_lakhs": 85.0,
            "amenities": ["gym", "parking"],
            "latitude": 12.9716,
            "longitude": 77.5946,
        }

        with patch("app.api.routes.properties.get_property_by_id", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_property

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.get("/api/v1/properties/12345678-1234-5678-1234-567812345678")

        assert response.status_code == 200
        data = response.json()
        assert data["city"] == "bangalore"
        assert data["bhk"] == 2

    @pytest.mark.asyncio
    async def test_get_property_not_found(self):
        """Should return 404 when property not found."""
        with patch("app.api.routes.properties.get_property_by_id", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = None

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.get("/api/v1/properties/12345678-1234-5678-1234-567812345678")

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_property_invalid_uuid(self):
        """Should return 422 for invalid UUID."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/api/v1/properties/not-a-valid-uuid")

        assert response.status_code == 422


class TestCompareEndpoint:
    """Tests for compare endpoint."""

    @pytest.mark.asyncio
    async def test_compare_success(self):
        """Should return compared properties."""
        mock_props = []
        for i in range(2):
            mock_prop = MagicMock()
            mock_prop.to_dict.return_value = {
                "id": f"1234567{i}-1234-5678-1234-567812345678",
                "city": "bangalore",
                "title": f"Property {i}",
                "area": "Whitefield",
                "bhk": 2,
                "sqft": 1200,
                "bathrooms": 2,
                "price_lakhs": 85.0,
                "amenities": ["gym"],
                "latitude": 12.9716,
                "longitude": 77.5946,
            }
            mock_props.append(mock_prop)

        with patch("app.api.routes.properties.get_properties_by_ids", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_props

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/api/v1/compare",
                    json={
                        "property_ids": [
                            "12345670-1234-5678-1234-567812345678",
                            "12345671-1234-5678-1234-567812345678"
                        ]
                    }
                )

        assert response.status_code == 200
        data = response.json()
        assert "properties" in data
        assert len(data["properties"]) == 2

    @pytest.mark.asyncio
    async def test_compare_too_few_properties(self):
        """Should reject comparison with less than 2 properties."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/compare",
                json={"property_ids": ["12345670-1234-5678-1234-567812345678"]}
            )

        assert response.status_code == 400

    @pytest.mark.asyncio
    async def test_compare_too_many_properties(self):
        """Should reject comparison with more than 5 properties."""
        ids = [f"1234567{i}-1234-5678-1234-567812345678" for i in range(6)]

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/compare",
                json={"property_ids": ids}
            )

        assert response.status_code == 400
