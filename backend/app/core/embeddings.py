import logging

from app.config import get_settings
from app.providers.embeddings import get_embedding_provider, EMBEDDING_DIMENSIONS

settings = get_settings()
logger = logging.getLogger(__name__)


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding using configured provider.

    Args:
        text: Text to generate embedding for

    Returns:
        List of floats representing the embedding

    Raises:
        EmbeddingError: If embedding generation fails
    """
    provider = get_embedding_provider()
    return await provider.embed(text)


def generate_property_text(property_data: dict) -> str:
    """Generate searchable text from property data for embedding."""
    parts = []

    if property_data.get("title"):
        parts.append(property_data["title"])

    if property_data.get("bhk"):
        parts.append(f"{property_data['bhk']} BHK")

    if property_data.get("area"):
        parts.append(f"in {property_data['area']}")

    if property_data.get("sqft"):
        parts.append(f"{property_data['sqft']} sqft")

    if property_data.get("price_lakhs"):
        parts.append(f"{property_data['price_lakhs']} lakhs")

    if property_data.get("amenities"):
        parts.append(f"amenities: {', '.join(property_data['amenities'])}")

    return " ".join(parts)
