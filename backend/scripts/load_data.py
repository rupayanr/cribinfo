#!/usr/bin/env python3
"""Load property data from CSV into the database."""

import argparse
import asyncio
import csv
import sys
from pathlib import Path
from uuid import uuid4

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.models.database import engine, async_session
from app.models.property import Base, Property


async def init_db():
    """Initialize database tables and pgvector extension."""
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)


async def load_csv(city: str, csv_path: Path):
    """Load properties from CSV file."""
    if not csv_path.exists():
        print(f"Error: CSV file not found at {csv_path}")
        return

    async with async_session() as db:
        with open(csv_path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            count = 0

            for row in reader:
                property_data = {
                    "id": uuid4(),
                    "city": city,
                    "title": row.get("title", ""),
                    "area": row.get("area", row.get("location", "")),
                    "bhk": int(row["bhk"]) if row.get("bhk") else None,
                    "sqft": int(float(row["sqft"])) if row.get("sqft") else None,
                    "bathrooms": int(row["bathrooms"]) if row.get("bathrooms") else None,
                    "price_lakhs": float(row["price_lakhs"]) if row.get("price_lakhs") else None,
                    "amenities": row.get("amenities", "").split("|") if row.get("amenities") else [],
                    "latitude": float(row["latitude"]) if row.get("latitude") else None,
                    "longitude": float(row["longitude"]) if row.get("longitude") else None,
                }

                property_obj = Property(**property_data)
                db.add(property_obj)
                count += 1

                if count % 100 == 0:
                    await db.commit()
                    print(f"Loaded {count} properties...")

            await db.commit()
            print(f"Successfully loaded {count} properties for {city}")


async def main():
    parser = argparse.ArgumentParser(description="Load property data into database")
    parser.add_argument("--city", required=True, help="City name (e.g., bangalore)")
    parser.add_argument("--csv", help="Path to CSV file (default: data/{city}/housing.csv)")
    args = parser.parse_args()

    csv_path = Path(args.csv) if args.csv else Path(__file__).parent.parent / "data" / args.city / "housing.csv"

    print(f"Initializing database...")
    await init_db()

    print(f"Loading data for {args.city} from {csv_path}...")
    await load_csv(args.city, csv_path)


if __name__ == "__main__":
    asyncio.run(main())
