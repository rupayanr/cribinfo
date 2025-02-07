"""Database setup script for Supabase."""
import asyncio
import sys
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add parent directory to path
sys.path.insert(0, str(__file__).rsplit("/", 2)[0])

from app.config import get_settings

settings = get_settings()

SCHEMA_SQL = """
-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city VARCHAR(50) NOT NULL,
    title VARCHAR(255),
    area VARCHAR(100),
    bhk INTEGER,
    sqft INTEGER,
    bathrooms INTEGER,
    price_lakhs DECIMAL(10, 2),
    amenities TEXT[],
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    embedding vector(768)
);

-- Create indexes (IF NOT EXISTS for idempotency)
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_area ON properties(area);
CREATE INDEX IF NOT EXISTS idx_properties_bhk ON properties(bhk);
"""

SAMPLE_DATA_SQL = """
INSERT INTO properties (city, title, area, bhk, sqft, bathrooms, price_lakhs, amenities, latitude, longitude)
VALUES
    ('bangalore', '2BHK Modern Apartment in Koramangala', 'Koramangala', 2, 1200, 2, 85, ARRAY['gym', 'parking', 'security'], 12.9352, 77.6245),
    ('bangalore', '3BHK Spacious Flat in Indiranagar', 'Indiranagar', 3, 1800, 3, 145, ARRAY['gym', 'swimming pool', 'parking', 'clubhouse'], 12.9784, 77.6408),
    ('bangalore', '2BHK Budget Apartment in Whitefield', 'Whitefield', 2, 1100, 2, 55, ARRAY['parking', 'security'], 12.9698, 77.7500),
    ('bangalore', '3BHK Premium Villa in HSR Layout', 'HSR Layout', 3, 2200, 3, 175, ARRAY['gym', 'swimming pool', 'garden', 'parking'], 12.9116, 77.6389),
    ('bangalore', '1BHK Studio in Electronic City', 'Electronic City', 1, 650, 1, 32, ARRAY['security', 'parking'], 12.8399, 77.6770),
    ('bangalore', '4BHK Luxury Penthouse in MG Road', 'MG Road', 4, 3500, 4, 350, ARRAY['gym', 'swimming pool', 'concierge', 'parking', 'rooftop'], 12.9757, 77.6062),
    ('bangalore', '2BHK Family Home in JP Nagar', 'JP Nagar', 2, 1300, 2, 72, ARRAY['parking', 'garden', 'security'], 12.9063, 77.5857),
    ('bangalore', '3BHK Gated Community in Sarjapur', 'Sarjapur Road', 3, 1650, 2, 95, ARRAY['gym', 'clubhouse', 'parking', 'playground'], 12.8673, 77.7870),
    ('bangalore', '2BHK Near Metro in Marathahalli', 'Marathahalli', 2, 1150, 2, 68, ARRAY['gym', 'parking'], 12.9591, 77.6971),
    ('bangalore', '3BHK Corner Unit in Hebbal', 'Hebbal', 3, 1900, 3, 125, ARRAY['swimming pool', 'gym', 'parking', 'security'], 13.0358, 77.5970),
    ('bangalore', '1BHK Compact Flat in BTM Layout', 'BTM Layout', 1, 600, 1, 38, ARRAY['security', 'parking'], 12.9166, 77.6101),
    ('bangalore', '2BHK with Garden in Bannerghatta', 'Bannerghatta Road', 2, 1250, 2, 65, ARRAY['garden', 'parking', 'security'], 12.8698, 77.5964),
    ('bangalore', '4BHK Duplex in Jayanagar', 'Jayanagar', 4, 2800, 4, 220, ARRAY['gym', 'garden', 'parking', 'servant quarters'], 12.9308, 77.5838),
    ('bangalore', '2BHK New Launch in Yelahanka', 'Yelahanka', 2, 1100, 2, 48, ARRAY['gym', 'parking', 'playground'], 13.1007, 77.5963),
    ('bangalore', '3BHK Ready to Move in Malleshwaram', 'Malleshwaram', 3, 1700, 2, 135, ARRAY['parking', 'security'], 13.0035, 77.5647)
ON CONFLICT DO NOTHING;
"""


async def setup_database():
    """Set up the database schema."""
    print(f"Connecting to database...")
    print(f"URL: {settings.database_url[:50]}...")

    engine = create_async_engine(settings.database_url, echo=True)

    async with engine.begin() as conn:
        print("\n--- Creating schema ---")
        for statement in SCHEMA_SQL.strip().split(';'):
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                await conn.execute(text(statement))
        print("Schema created successfully!")

        # Check if we should seed data
        result = await conn.execute(text("SELECT COUNT(*) FROM properties"))
        count = result.scalar()

        if count == 0:
            print("\n--- Seeding sample data ---")
            await conn.execute(text(SAMPLE_DATA_SQL))
            print("Sample data inserted!")
        else:
            print(f"\n--- Skipping seed (already have {count} properties) ---")

    await engine.dispose()
    print("\nDatabase setup complete!")


if __name__ == "__main__":
    asyncio.run(setup_database())
