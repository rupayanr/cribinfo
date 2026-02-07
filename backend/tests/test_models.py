"""Tests for model classes."""
import pytest
from decimal import Decimal
from uuid import UUID, uuid4

from app.models.property import Property


class TestPropertyModel:
    """Tests for Property model."""

    def test_to_dict_with_all_fields(self):
        """Should convert property with all fields to dict."""
        prop = Property(
            id=uuid4(),
            city="bangalore",
            title="Test Property",
            area="Whitefield",
            bhk=2,
            sqft=1200,
            bathrooms=2,
            price_lakhs=Decimal("85.50"),
            amenities=["gym", "parking"],
            latitude=Decimal("12.97160000"),
            longitude=Decimal("77.59460000"),
        )

        result = prop.to_dict()

        assert result["city"] == "bangalore"
        assert result["title"] == "Test Property"
        assert result["area"] == "Whitefield"
        assert result["bhk"] == 2
        assert result["sqft"] == 1200
        assert result["bathrooms"] == 2
        assert result["price_lakhs"] == 85.50
        assert result["amenities"] == ["gym", "parking"]
        assert result["latitude"] == 12.9716
        assert result["longitude"] == 77.5946

    def test_to_dict_with_none_values(self):
        """Should handle None values correctly."""
        prop = Property(
            id=uuid4(),
            city="bangalore",
            title=None,
            area=None,
            bhk=None,
            sqft=None,
            bathrooms=None,
            price_lakhs=None,
            amenities=None,
            latitude=None,
            longitude=None,
        )

        result = prop.to_dict()

        assert result["city"] == "bangalore"
        assert result["title"] is None
        assert result["area"] is None
        assert result["bhk"] is None
        assert result["sqft"] is None
        assert result["bathrooms"] is None
        assert result["price_lakhs"] is None
        assert result["amenities"] == []  # Should default to empty list
        assert result["latitude"] is None
        assert result["longitude"] is None

    def test_to_dict_id_is_string(self):
        """Should convert UUID id to string."""
        test_id = uuid4()
        prop = Property(
            id=test_id,
            city="bangalore",
        )

        result = prop.to_dict()

        assert result["id"] == str(test_id)
        assert isinstance(result["id"], str)

    def test_to_dict_decimal_conversion(self):
        """Should convert Decimal values to float."""
        prop = Property(
            id=uuid4(),
            city="mumbai",
            price_lakhs=Decimal("150.75"),
            latitude=Decimal("19.07600000"),
            longitude=Decimal("72.87770000"),
        )

        result = prop.to_dict()

        assert isinstance(result["price_lakhs"], float)
        assert isinstance(result["latitude"], float)
        assert isinstance(result["longitude"], float)
        assert result["price_lakhs"] == 150.75
