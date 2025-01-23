#!/usr/bin/env python3
"""Generate embeddings for all properties that don't have them."""

import argparse
import asyncio
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.models.database import async_session
from app.models.property import Property
from app.core.embeddings import generate_embedding, generate_property_text


async def generate_embeddings_for_city(city: str, batch_size: int = 50):
    """Generate embeddings for properties in a city that don't have them."""

    async with async_session() as db:
        # Get properties without embeddings
        stmt = select(Property).where(
            Property.city == city,
            Property.embedding.is_(None)
        )
        result = await db.execute(stmt)
        properties = list(result.scalars().all())

        print(f"Found {len(properties)} properties without embeddings in {city}")

        for i, prop in enumerate(properties):
            property_text = generate_property_text(prop.to_dict())
            embedding = await generate_embedding(property_text)
            prop.embedding = embedding

            if (i + 1) % batch_size == 0:
                await db.commit()
                print(f"Generated embeddings for {i + 1}/{len(properties)} properties")

        await db.commit()
        print(f"Completed generating embeddings for {len(properties)} properties in {city}")


async def main():
    parser = argparse.ArgumentParser(description="Generate embeddings for properties")
    parser.add_argument("--city", required=True, help="City name (e.g., bangalore)")
    parser.add_argument("--batch-size", type=int, default=50, help="Batch size for commits")
    args = parser.parse_args()

    print(f"Generating embeddings for {args.city}...")
    await generate_embeddings_for_city(args.city, args.batch_size)


if __name__ == "__main__":
    asyncio.run(main())
