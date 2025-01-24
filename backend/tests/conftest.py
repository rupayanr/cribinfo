"""Pytest configuration and fixtures."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

from app.main import app
from app.models.database import get_db


# Mock database session fixture
@pytest.fixture
def mock_db_session():
    """Create a mock database session."""
    session = AsyncMock(spec=AsyncSession)
    return session


@pytest.fixture
def mock_property():
    """Create a mock Property object."""
    prop = MagicMock()
    prop.id = "test-id-123"
    prop.city = "bangalore"
    prop.title = "Test Property"
    prop.area = "Whitefield"
    prop.bhk = 2
    prop.sqft = 1200
    prop.bathrooms = 2
    prop.price_lakhs = 85.0
    prop.amenities = ["gym", "parking"]
    prop.latitude = 12.9716
    prop.longitude = 77.5946
    prop.to_dict = MagicMock(return_value={
        "id": "test-id-123",
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
    })
    return prop


@pytest.fixture
async def async_client():
    """Create an async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def mock_ollama():
    """Mock Ollama responses."""
    with patch("ollama.chat") as mock:
        mock.return_value = {
            "message": {
                "content": '{"bhk": 2, "max_price": 100, "amenities": ["gym"], "area": null}'
            }
        }
        yield mock


@pytest.fixture
def mock_embedding():
    """Mock embedding generation."""
    with patch("app.core.embeddings.generate_embedding") as mock:
        mock.return_value = [0.1] * 768  # 768-dim vector
        yield mock
