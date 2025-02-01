"""Tests for API endpoints."""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.query_parser import ParsedQuery
from app.core.search_engine import SearchResult


class TestHealthEndpoint:
    """Tests for health check endpoint."""

    @pytest.mark.asyncio
    async def test_health_check(self):
        """Should return healthy status."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.get("/health")

        assert response.status_code == 200
        assert response.json() == {"status": "healthy"}


class TestSearchEndpoint:
    """Tests for search endpoint."""

    @pytest.mark.asyncio
    async def test_search_success(self, mock_property):
        """Should return search results successfully."""
        mock_parsed = ParsedQuery(
            bhk=2,
            max_price=100,
            amenities=["gym"],
            raw_query="2BHK under 1Cr with gym"
        )
        mock_result = SearchResult(
            properties=[mock_property],
            match_type="exact",
            relaxed_filters=[]
        )

        with patch("app.api.routes.search.parse_query", new_callable=AsyncMock) as mock_parse, \
             patch("app.api.routes.search.hybrid_search", new_callable=AsyncMock) as mock_search, \
             patch("app.api.routes.search.get_db") as mock_get_db:

            mock_parse.return_value = mock_parsed
            mock_search.return_value = mock_result

            # Mock the database dependency
            mock_db = AsyncMock()
            mock_get_db.return_value = mock_db

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/api/v1/search",
                    json={"query": "2BHK under 1Cr with gym", "city": "bangalore", "limit": 10}
                )

        assert response.status_code == 200
        data = response.json()
        assert "results" in data
        assert "parsed_filters" in data
        assert "total" in data
        assert "match_type" in data
        assert "relaxed_filters" in data

    @pytest.mark.asyncio
    async def test_search_empty_query(self):
        """Should reject empty query with validation error."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            response = await client.post(
                "/api/v1/search",
                json={"query": "", "city": "", "limit": 10}
            )

        # Empty query should be rejected by validation
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_search_all_cities(self, mock_property):
        """Should search across all cities when city is empty."""
        mock_parsed = ParsedQuery(
            bhk=2,
            raw_query="2BHK flat"
        )
        mock_result = SearchResult(
            properties=[mock_property],
            match_type="exact",
            relaxed_filters=[]
        )

        with patch("app.api.routes.search.parse_query", new_callable=AsyncMock) as mock_parse, \
             patch("app.api.routes.search.hybrid_search", new_callable=AsyncMock) as mock_search:

            mock_parse.return_value = mock_parsed
            mock_search.return_value = mock_result

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/api/v1/search",
                    json={"query": "2BHK flat", "city": "", "limit": 10}
                )

        assert response.status_code == 200
        # Verify hybrid_search was called with empty city
        mock_search.assert_called_once()
        call_args = mock_search.call_args
        assert call_args[0][2] == ""  # city argument

    @pytest.mark.asyncio
    async def test_search_with_partial_match(self, mock_property):
        """Should return partial match info."""
        mock_parsed = ParsedQuery(
            bhk=5,
            area="Whitefield",
            raw_query="5BHK in Whitefield",
            inferred_city="bangalore"
        )
        mock_result = SearchResult(
            properties=[mock_property],
            match_type="partial",
            relaxed_filters=["bhk"]
        )

        with patch("app.api.routes.search.parse_query", new_callable=AsyncMock) as mock_parse, \
             patch("app.api.routes.search.hybrid_search", new_callable=AsyncMock) as mock_search:

            mock_parse.return_value = mock_parsed
            mock_search.return_value = mock_result

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/api/v1/search",
                    json={"query": "5BHK in Whitefield", "city": "", "limit": 10}
                )

        assert response.status_code == 200
        data = response.json()
        assert data["match_type"] == "partial"
        assert "bhk" in data["relaxed_filters"]

    @pytest.mark.asyncio
    async def test_search_request_validation(self):
        """Should validate request body."""
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="http://test") as client:
            # Missing required 'query' field
            response = await client.post(
                "/api/v1/search",
                json={"city": "bangalore"}
            )

        assert response.status_code == 422  # Validation error


class TestSearchResponse:
    """Tests for search response structure."""

    @pytest.mark.asyncio
    async def test_response_includes_all_fields(self, mock_property):
        """Should include all required fields in response."""
        mock_parsed = ParsedQuery(
            bhk=2,
            max_price=100,
            amenities=["gym"],
            raw_query="test"
        )
        mock_result = SearchResult(
            properties=[mock_property],
            match_type="exact",
            relaxed_filters=[]
        )

        with patch("app.api.routes.search.parse_query", new_callable=AsyncMock) as mock_parse, \
             patch("app.api.routes.search.hybrid_search", new_callable=AsyncMock) as mock_search:

            mock_parse.return_value = mock_parsed
            mock_search.return_value = mock_result

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/api/v1/search",
                    json={"query": "test", "city": "bangalore", "limit": 10}
                )

        data = response.json()

        # Check top-level fields
        assert "results" in data
        assert "parsed_filters" in data
        assert "total" in data
        assert "match_type" in data
        assert "relaxed_filters" in data

        # Check parsed_filters structure
        filters = data["parsed_filters"]
        assert "bhk" in filters
        assert "min_price" in filters
        assert "max_price" in filters
        assert "area" in filters
        assert "amenities" in filters

    @pytest.mark.asyncio
    async def test_property_response_structure(self, mock_property):
        """Should return properly structured property objects."""
        mock_parsed = ParsedQuery(raw_query="test")
        mock_result = SearchResult(
            properties=[mock_property],
            match_type="exact",
            relaxed_filters=[]
        )

        with patch("app.api.routes.search.parse_query", new_callable=AsyncMock) as mock_parse, \
             patch("app.api.routes.search.hybrid_search", new_callable=AsyncMock) as mock_search:

            mock_parse.return_value = mock_parsed
            mock_search.return_value = mock_result

            transport = ASGITransport(app=app)
            async with AsyncClient(transport=transport, base_url="http://test") as client:
                response = await client.post(
                    "/api/v1/search",
                    json={"query": "test", "city": "", "limit": 10}
                )

        data = response.json()
        assert len(data["results"]) == 1

        prop = data["results"][0]
        assert "id" in prop
        assert "city" in prop
        assert "title" in prop
        assert "area" in prop
        assert "bhk" in prop
        assert "sqft" in prop
        assert "bathrooms" in prop
        assert "price_lakhs" in prop
        assert "amenities" in prop
        assert "latitude" in prop
        assert "longitude" in prop
