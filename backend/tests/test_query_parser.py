"""Tests for query parser module."""
import pytest
from unittest.mock import patch, MagicMock

from app.core.query_parser import (
    extract_json,
    infer_city_from_area,
    parse_query,
    ParsedQuery,
    AREA_CITY_MAP,
)


class TestExtractJson:
    """Tests for JSON extraction from LLM responses."""

    def test_extract_clean_json(self):
        """Should extract valid JSON from clean response."""
        text = '{"bhk": 2, "max_price": 100}'
        result = extract_json(text)
        assert result == {"bhk": 2, "max_price": 100}

    def test_extract_json_with_surrounding_text(self):
        """Should extract JSON when surrounded by text."""
        text = 'Here is the result: {"bhk": 3, "area": "Whitefield"} hope this helps!'
        result = extract_json(text)
        assert result == {"bhk": 3, "area": "Whitefield"}

    def test_extract_json_with_newlines(self):
        """Should handle JSON with newlines."""
        text = '{"bhk": 2,\n"max_price": 100}'
        result = extract_json(text)
        assert result == {"bhk": 2, "max_price": 100}

    def test_invalid_json_returns_empty_dict(self):
        """Should return empty dict for invalid JSON."""
        text = "not json at all"
        result = extract_json(text)
        assert result == {}

    def test_empty_json_object(self):
        """Should handle empty JSON object."""
        text = "{}"
        result = extract_json(text)
        assert result == {}

    def test_json_with_null_values(self):
        """Should handle JSON with null values."""
        text = '{"bhk": null, "area": "Koramangala"}'
        result = extract_json(text)
        assert result == {"bhk": None, "area": "Koramangala"}

    def test_json_with_array(self):
        """Should handle JSON with array values."""
        text = '{"amenities": ["gym", "pool", "parking"]}'
        result = extract_json(text)
        assert result == {"amenities": ["gym", "pool", "parking"]}


class TestInferCityFromArea:
    """Tests for area to city inference."""

    def test_bangalore_areas(self):
        """Should correctly infer Bangalore from its areas."""
        bangalore_areas = [
            "Koramangala", "koramangala", "KORAMANGALA",
            "Whitefield", "whitefield",
            "Indiranagar", "Electronic City", "HSR Layout",
            "BTM Layout", "Sarjapur", "Hebbal", "Marathahalli",
        ]
        for area in bangalore_areas:
            result = infer_city_from_area(area)
            assert result == "bangalore", f"Failed for area: {area}"

    def test_mumbai_areas(self):
        """Should correctly infer Mumbai from its areas."""
        mumbai_areas = [
            "Bandra", "bandra", "Bandra West",
            "Andheri", "Andheri East", "Andheri West",
            "Worli", "Powai", "Goregaon", "Juhu", "Thane",
        ]
        for area in mumbai_areas:
            result = infer_city_from_area(area)
            assert result == "mumbai", f"Failed for area: {area}"

    def test_delhi_areas(self):
        """Should correctly infer Delhi from its areas."""
        delhi_areas = [
            "Greater Kailash", "GK", "Dwarka",
            "Noida", "Gurgaon", "Gurugram",
            "DLF Phase 5", "Hauz Khas", "Saket",
        ]
        for area in delhi_areas:
            result = infer_city_from_area(area)
            assert result == "delhi", f"Failed for area: {area}"

    def test_none_area(self):
        """Should return None for None input."""
        result = infer_city_from_area(None)
        assert result is None

    def test_empty_area(self):
        """Should return None for empty string."""
        result = infer_city_from_area("")
        assert result is None

    def test_unknown_area(self):
        """Should return None for unknown areas."""
        result = infer_city_from_area("Unknown Place XYZ")
        assert result is None

    def test_partial_match(self):
        """Should handle partial matches."""
        result = infer_city_from_area("Near Whitefield")
        assert result == "bangalore"

    def test_case_insensitive(self):
        """Should be case insensitive."""
        assert infer_city_from_area("KORAMANGALA") == "bangalore"
        assert infer_city_from_area("bandra") == "mumbai"
        assert infer_city_from_area("NoIdA") == "delhi"


class TestParsedQuery:
    """Tests for ParsedQuery model."""

    def test_default_values(self):
        """Should have correct default values."""
        query = ParsedQuery()
        assert query.bhk is None
        assert query.min_price is None
        assert query.max_price is None
        assert query.min_sqft is None
        assert query.max_sqft is None
        assert query.area is None
        assert query.amenities == []
        assert query.raw_query == ""
        assert query.inferred_city is None

    def test_with_values(self):
        """Should accept provided values."""
        query = ParsedQuery(
            bhk=2,
            max_price=100,
            area="Whitefield",
            amenities=["gym"],
            raw_query="2BHK under 1Cr with gym",
            inferred_city="bangalore"
        )
        assert query.bhk == 2
        assert query.max_price == 100
        assert query.area == "Whitefield"
        assert query.amenities == ["gym"]
        assert query.inferred_city == "bangalore"


class TestParseQuery:
    """Tests for the main parse_query function."""

    @pytest.mark.asyncio
    async def test_parse_basic_query(self, mock_ollama):
        """Should parse basic query correctly."""
        result = await parse_query("2BHK under 1Cr with gym")

        assert result.bhk == 2
        assert result.max_price == 100
        assert result.amenities == ["gym"]
        assert result.raw_query == "2BHK under 1Cr with gym"

    @pytest.mark.asyncio
    async def test_parse_query_with_area(self, mock_ollama):
        """Should infer city when area is returned."""
        mock_ollama.return_value = {
            "message": {
                "content": '{"bhk": 3, "area": "Whitefield", "max_price": null}'
            }
        }
        result = await parse_query("3BHK in Whitefield")

        assert result.bhk == 3
        assert result.area == "Whitefield"
        assert result.inferred_city == "bangalore"

    @pytest.mark.asyncio
    async def test_parse_query_ollama_called(self, mock_ollama):
        """Should call Ollama with correct parameters."""
        await parse_query("test query")

        mock_ollama.assert_called_once()
        call_args = mock_ollama.call_args
        assert call_args[1]["options"]["temperature"] == 0


class TestAreaCityMap:
    """Tests for AREA_CITY_MAP completeness."""

    def test_bangalore_coverage(self):
        """Should have key Bangalore areas."""
        bangalore_areas = ["koramangala", "whitefield", "indiranagar", "hsr layout"]
        for area in bangalore_areas:
            assert area in AREA_CITY_MAP
            assert AREA_CITY_MAP[area] == "bangalore"

    def test_mumbai_coverage(self):
        """Should have key Mumbai areas."""
        mumbai_areas = ["bandra", "andheri", "powai", "worli"]
        for area in mumbai_areas:
            assert area in AREA_CITY_MAP
            assert AREA_CITY_MAP[area] == "mumbai"

    def test_delhi_coverage(self):
        """Should have key Delhi areas."""
        delhi_areas = ["noida", "gurgaon", "dwarka", "saket"]
        for area in delhi_areas:
            assert area in AREA_CITY_MAP
            assert AREA_CITY_MAP[area] == "delhi"
