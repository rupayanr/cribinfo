import ollama
from app.config import get_settings

settings = get_settings()

# nomic-embed-text produces 768-dimensional embeddings
EMBEDDING_DIMENSIONS = 768


async def generate_embedding(text: str) -> list[float]:
    """Generate embedding using Ollama."""
    response = ollama.embed(
        model=settings.ollama_embed_model,
        input=text,
    )
    return response["embeddings"][0]


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
