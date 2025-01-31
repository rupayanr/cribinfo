import logging
import ollama
from ollama import ResponseError

from app.config import get_settings
from app.core.exceptions import EmbeddingError

settings = get_settings()
logger = logging.getLogger(__name__)

# nomic-embed-text produces 768-dimensional embeddings
EMBEDDING_DIMENSIONS = 768


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding using Ollama.

    Args:
        text: Text to generate embedding for

    Returns:
        List of floats representing the embedding

    Raises:
        EmbeddingError: If embedding generation fails
    """
    if not text or not text.strip():
        logger.warning("Empty text provided for embedding, using placeholder")
        return [0.0] * EMBEDDING_DIMENSIONS

    try:
        response = ollama.embed(
            model=settings.ollama_embed_model,
            input=text,
        )
        return response["embeddings"][0]
    except ResponseError as e:
        logger.error(f"Ollama embedding error: {e}")
        raise EmbeddingError(f"Embedding service unavailable: {str(e)}")
    except ConnectionError as e:
        logger.error(f"Cannot connect to Ollama: {e}")
        raise EmbeddingError("Cannot connect to embedding service. Please try again later.")
    except Exception as e:
        logger.exception(f"Unexpected embedding error: {e}")
        raise EmbeddingError("Failed to generate embedding")


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
