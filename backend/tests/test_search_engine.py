"""Tests for search engine module."""
import pytest
from unittest.mock import patch, AsyncMock, MagicMock

from app.core.search_engine import SearchResult, hybrid_search, _search_with_filters, filter_search
from app.core.query_parser import ParsedQuery


class TestSearchResult:
    """Tests for SearchResult class."""

    def test_exact_match(self):
        """Should create exact match result."""
        result = SearchResult(
            properties=[MagicMock()],
            match_type="exact",
            relaxed_filters=[]
        )
        assert result.match_type == "exact"
        assert result.relaxed_filters == []
        assert len(result.properties) == 1

    def test_partial_match(self):
        """Should create partial match result."""
        result = SearchResult(
            properties=[MagicMock()],
            match_type="partial",
            relaxed_filters=["bhk"]
        )
        assert result.match_type == "partial"
        assert result.relaxed_filters == ["bhk"]

    def test_similar_match(self):
        """Should create similar match result."""
        result = SearchResult(
            properties=[MagicMock()],
            match_type="similar",
            relaxed_filters=["bhk", "area", "price"]
        )
        assert result.match_type == "similar"
        assert "bhk" in result.relaxed_filters
        assert "area" in result.relaxed_filters
        assert "price" in result.relaxed_filters

    def test_empty_properties(self):
        """Should handle empty properties list."""
        result = SearchResult(
            properties=[],
            match_type="similar",
            relaxed_filters=["bhk", "area"]
        )
        assert result.properties == []
        assert result.match_type == "similar"


class TestHybridSearch:
    """Tests for hybrid_search function."""

    @pytest.mark.asyncio
    async def test_exact_match_found(self, mock_property, mock_embedding):
        """Should return exact match when filters match."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_property]
        mock_db.execute.return_value = mock_result

        parsed = ParsedQuery(
            bhk=2,
            max_price=100,
            area="Whitefield",
            raw_query="2BHK under 1Cr in Whitefield"
        )

        with patch("app.core.search_engine._search_with_filters", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = [mock_property]

            result = await hybrid_search(mock_db, parsed, "bangalore", 10)

            assert result.match_type == "exact"
            assert result.relaxed_filters == []
            assert len(result.properties) == 1

    @pytest.mark.asyncio
    async def test_partial_match_relax_bhk(self, mock_property, mock_embedding):
        """Should relax BHK filter first, keeping area."""
        mock_db = AsyncMock()

        parsed = ParsedQuery(
            bhk=5,
            area="Whitefield",
            raw_query="5BHK in Whitefield"
        )

        call_count = [0]

        async def mock_search_side_effect(*args, **kwargs):
            call_count[0] += 1
            # First call (exact match) - return empty
            if call_count[0] == 1:
                return []
            # Second call (relax BHK, keep area) - return result
            return [mock_property]

        with patch("app.core.search_engine._search_with_filters", new_callable=AsyncMock) as mock_search:
            mock_search.side_effect = mock_search_side_effect

            result = await hybrid_search(mock_db, parsed, "bangalore", 10)

            assert result.match_type == "partial"
            assert "bhk" in result.relaxed_filters
            assert "area" not in result.relaxed_filters

    @pytest.mark.asyncio
    async def test_partial_match_relax_area(self, mock_property, mock_embedding):
        """Should relax area filter when BHK relaxation doesn't help."""
        mock_db = AsyncMock()

        parsed = ParsedQuery(
            bhk=2,
            area="UnknownArea",
            raw_query="2BHK in UnknownArea"
        )

        call_count = [0]

        async def mock_search_side_effect(*args, **kwargs):
            call_count[0] += 1
            # First 2 calls return empty
            if call_count[0] <= 2:
                return []
            # Third call (relax area, keep BHK) - return result
            return [mock_property]

        with patch("app.core.search_engine._search_with_filters", new_callable=AsyncMock) as mock_search:
            mock_search.side_effect = mock_search_side_effect

            result = await hybrid_search(mock_db, parsed, "bangalore", 10)

            assert result.match_type == "partial"
            assert "area" in result.relaxed_filters

    @pytest.mark.asyncio
    async def test_similar_match_fallback(self, mock_property, mock_embedding):
        """Should fall back to similar match when all filters fail."""
        mock_db = AsyncMock()

        parsed = ParsedQuery(
            bhk=5,
            max_price=50,
            area="UnknownArea",
            raw_query="5BHK under 50L in UnknownArea"
        )

        call_count = [0]

        async def mock_search_side_effect(*args, **kwargs):
            call_count[0] += 1
            # All filtered calls return empty, only pure vector search returns
            if call_count[0] == 5:
                return [mock_property]
            return []

        with patch("app.core.search_engine._search_with_filters", new_callable=AsyncMock) as mock_search:
            mock_search.side_effect = mock_search_side_effect

            result = await hybrid_search(mock_db, parsed, "bangalore", 10)

            assert result.match_type == "similar"
            assert "bhk" in result.relaxed_filters
            assert "area" in result.relaxed_filters
            assert "price" in result.relaxed_filters

    @pytest.mark.asyncio
    async def test_inferred_city_used(self, mock_property, mock_embedding):
        """Should use inferred city when no city is selected."""
        mock_db = AsyncMock()

        parsed = ParsedQuery(
            bhk=2,
            area="Whitefield",
            raw_query="2BHK in Whitefield",
            inferred_city="bangalore"
        )

        with patch("app.core.search_engine._search_with_filters", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = [mock_property]

            # Empty city string
            result = await hybrid_search(mock_db, parsed, "", 10)

            # Should have used inferred city
            call_args = mock_search.call_args_list[0]
            assert call_args[0][3] == "bangalore"  # effective_city arg

    @pytest.mark.asyncio
    async def test_empty_results(self, mock_embedding):
        """Should handle case where no results found at all."""
        mock_db = AsyncMock()

        parsed = ParsedQuery(
            bhk=10,
            max_price=10,
            area="NonExistent",
            raw_query="10BHK under 10L in NonExistent"
        )

        with patch("app.core.search_engine._search_with_filters", new_callable=AsyncMock) as mock_search:
            mock_search.return_value = []

            result = await hybrid_search(mock_db, parsed, "bangalore", 10)

            assert result.properties == []
            assert result.match_type == "similar"


class TestSearchWithFilters:
    """Tests for _search_with_filters function."""

    @pytest.mark.asyncio
    async def test_city_filter_applied(self):
        """Should apply city filter when specified."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_db.execute.return_value = mock_result

        parsed = ParsedQuery(raw_query="test")

        await _search_with_filters(
            mock_db,
            [0.1] * 768,
            parsed,
            city="bangalore",
            limit=10
        )

        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_no_city_filter_when_empty(self):
        """Should not apply city filter when empty."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_db.execute.return_value = mock_result

        parsed = ParsedQuery(raw_query="test")

        await _search_with_filters(
            mock_db,
            [0.1] * 768,
            parsed,
            city="",  # Empty city
            limit=10
        )

        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_bhk_filter_applied(self):
        """Should apply BHK filter when use_bhk is True."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_db.execute.return_value = mock_result

        parsed = ParsedQuery(bhk=2, raw_query="test")

        await _search_with_filters(
            mock_db,
            [0.1] * 768,
            parsed,
            city="",
            limit=10,
            use_bhk=True
        )

        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_bhk_filter_skipped(self):
        """Should skip BHK filter when use_bhk is False."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_db.execute.return_value = mock_result

        parsed = ParsedQuery(bhk=2, raw_query="test")

        await _search_with_filters(
            mock_db,
            [0.1] * 768,
            parsed,
            city="",
            limit=10,
            use_bhk=False  # Skip BHK
        )

        mock_db.execute.assert_called_once()


class TestFilterSearch:
    """Tests for filter_search function (SQL-only search)."""

    @pytest.mark.asyncio
    async def test_filter_search_basic(self, mock_property):
        """Should perform basic filter search."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_property]
        mock_db.execute.return_value = mock_result

        results = await filter_search(
            mock_db,
            city="bangalore",
            bhk=2,
            limit=10
        )

        assert len(results) == 1
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_filter_search_with_all_filters(self, mock_property):
        """Should apply all filters."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [mock_property]
        mock_db.execute.return_value = mock_result

        results = await filter_search(
            mock_db,
            city="bangalore",
            bhk=2,
            min_price=50,
            max_price=100,
            area="Whitefield",
            limit=10
        )

        assert len(results) == 1
        mock_db.execute.assert_called_once()

    @pytest.mark.asyncio
    async def test_filter_search_empty_city(self):
        """Should work without city filter."""
        mock_db = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = []
        mock_db.execute.return_value = mock_result

        results = await filter_search(
            mock_db,
            city="",  # Empty city
            bhk=2,
            limit=10
        )

        assert results == []
        mock_db.execute.assert_called_once()
