#!/usr/bin/env python3
"""Generate realistic property data for CribInfo demo.

This script generates diverse, realistic property data for multiple cities
with varied amenities, realistic pricing based on location, and actual
neighborhood coordinates.

Usage:
    python scripts/generate_data.py --city bangalore --count 75
    python scripts/generate_data.py --all --count 75
"""

import argparse
import csv
import random
from pathlib import Path
from dataclasses import dataclass

# Seed for reproducibility
random.seed(42)


@dataclass
class Area:
    """Represents a neighborhood with coordinates and price tier."""
    name: str
    lat: float
    lng: float
    tier: str  # "premium", "mid", "budget"


# City-specific data with real coordinates and neighborhoods
CITY_DATA = {
    "bangalore": {
        "areas": [
            Area("Koramangala", 12.9352, 77.6245, "premium"),
            Area("Indiranagar", 12.9784, 77.6408, "premium"),
            Area("Whitefield", 12.9698, 77.7500, "mid"),
            Area("HSR Layout", 12.9116, 77.6389, "premium"),
            Area("BTM Layout", 12.9166, 77.6101, "mid"),
            Area("Electronic City", 12.8456, 77.6603, "budget"),
            Area("Sarjapur Road", 12.9107, 77.6872, "mid"),
            Area("Marathahalli", 12.9591, 77.6974, "mid"),
            Area("Hebbal", 13.0358, 77.5970, "mid"),
            Area("Yelahanka", 13.1007, 77.5963, "budget"),
            Area("JP Nagar", 12.9063, 77.5857, "mid"),
            Area("Bannerghatta Road", 12.8898, 77.5968, "budget"),
            Area("MG Road", 12.9756, 77.6062, "premium"),
            Area("Jayanagar", 12.9299, 77.5838, "premium"),
            Area("Malleshwaram", 13.0035, 77.5647, "mid"),
        ],
        "price_multiplier": 1.0,  # Base prices
    },
    "mumbai": {
        "areas": [
            Area("Bandra West", 19.0596, 72.8295, "premium"),
            Area("Andheri West", 19.1196, 72.8464, "mid"),
            Area("Powai", 19.1176, 72.9060, "premium"),
            Area("Thane", 19.2183, 72.9781, "mid"),
            Area("Navi Mumbai", 19.0330, 73.0297, "budget"),
            Area("Goregaon", 19.1663, 72.8526, "mid"),
            Area("Worli", 19.0176, 72.8154, "premium"),
            Area("Lower Parel", 18.9980, 72.8320, "premium"),
            Area("Mulund", 19.1726, 72.9565, "budget"),
            Area("Kandivali", 19.2067, 72.8475, "mid"),
            Area("Borivali", 19.2307, 72.8567, "mid"),
            Area("Malad", 19.1871, 72.8486, "mid"),
            Area("Chembur", 19.0522, 72.8994, "mid"),
            Area("Vashi", 19.0771, 72.9987, "budget"),
            Area("Kharghar", 19.0477, 73.0671, "budget"),
        ],
        "price_multiplier": 1.8,  # Mumbai is ~80% more expensive
    },
    "delhi": {
        "areas": [
            Area("Greater Kailash", 28.5494, 77.2340, "premium"),
            Area("Vasant Kunj", 28.5200, 77.1556, "mid"),
            Area("Dwarka", 28.5921, 77.0460, "mid"),
            Area("Saket", 28.5267, 77.2167, "premium"),
            Area("Rohini", 28.7495, 77.0561, "mid"),
            Area("Janakpuri", 28.6219, 77.0878, "mid"),
            Area("Defence Colony", 28.5740, 77.2311, "premium"),
            Area("Lajpat Nagar", 28.5700, 77.2425, "mid"),
            Area("Noida Sector 62", 28.6247, 77.3597, "mid"),
            Area("Gurgaon Sector 56", 28.4264, 77.0493, "premium"),
            Area("Pitampura", 28.7041, 77.1391, "mid"),
            Area("Mayur Vihar", 28.6090, 77.2936, "mid"),
            Area("Hauz Khas", 28.5494, 77.1949, "premium"),
            Area("Noida Sector 137", 28.5467, 77.4103, "budget"),
            Area("Greater Noida", 28.4744, 77.5040, "budget"),
        ],
        "price_multiplier": 1.2,  # Delhi is ~20% more expensive than Bangalore
    },
}

# Property title templates by type
TITLE_TEMPLATES = {
    "luxury": [
        "Luxury {} in {}",
        "Premium {} with City View",
        "Exquisite {} in Prime Location",
        "Designer {} in {}",
        "Ultra-Modern {} in {}",
    ],
    "modern": [
        "Modern {} in {}",
        "Contemporary {} with Amenities",
        "Stylish {} in {}",
        "Updated {} Near Metro",
        "Smart Home {} in {}",
    ],
    "family": [
        "Spacious Family {} in {}",
        "Well-Maintained {} in {}",
        "Bright & Airy {} in {}",
        "Corner {} with Parking",
        "Vastu-Compliant {} in {}",
    ],
    "budget": [
        "Affordable {} in {}",
        "Budget-Friendly {} Near Schools",
        "Compact {} in {}",
        "Value-for-Money {} in {}",
        "Newly Renovated {} in {}",
    ],
    "studio": [
        "Cozy Studio in {}",
        "Modern Studio with Amenities",
        "Compact Studio in {}",
        "Furnished Studio Near Metro",
        "Studio with City View",
    ],
}

# Property types based on BHK
PROPERTY_TYPES = {
    1: ["Studio", "Apartment", "Flat"],
    2: ["Apartment", "Flat", "Builder Floor"],
    3: ["Apartment", "Flat", "Villa", "Duplex"],
    4: ["Villa", "Duplex", "Penthouse", "Bungalow"],
    5: ["Villa", "Bungalow", "Independent House", "Farmhouse"],
}

# All available amenities with weights (higher = more common)
AMENITIES = [
    ("parking", 0.9),
    ("security", 0.85),
    ("power backup", 0.75),
    ("lift", 0.7),
    ("gym", 0.5),
    ("swimming pool", 0.3),
    ("garden", 0.4),
    ("clubhouse", 0.25),
    ("children play area", 0.35),
    ("rainwater harvesting", 0.3),
    ("fire safety", 0.6),
    ("cctv", 0.55),
    ("intercom", 0.5),
    ("visitor parking", 0.4),
    ("jogging track", 0.2),
    ("tennis court", 0.1),
    ("indoor games", 0.25),
    ("meditation room", 0.15),
    ("party hall", 0.2),
    ("concierge", 0.1),
    ("ev charging", 0.15),
    ("solar panels", 0.1),
    ("pet friendly", 0.2),
    ("gated community", 0.4),
    ("vastu compliant", 0.35),
]

# BHK distribution
BHK_DISTRIBUTION = [
    (1, 0.15),  # 15% 1BHK
    (2, 0.35),  # 35% 2BHK
    (3, 0.30),  # 30% 3BHK
    (4, 0.15),  # 15% 4BHK
    (5, 0.05),  # 5% 5BHK
]

# Size ranges by BHK (in sqft)
SIZE_RANGES = {
    1: (400, 700),
    2: (800, 1300),
    3: (1200, 2000),
    4: (1800, 3200),
    5: (2800, 5000),
}

# Base price per sqft by tier (in rupees)
BASE_PRICE_PER_SQFT = {
    "premium": (8000, 15000),
    "mid": (5000, 9000),
    "budget": (3000, 6000),
}


def weighted_choice(choices: list[tuple]) -> any:
    """Select item based on weights."""
    items, weights = zip(*choices)
    return random.choices(items, weights=weights, k=1)[0]


def generate_amenities(bhk: int, tier: str) -> list[str]:
    """Generate realistic amenities based on property type."""
    selected = []

    # Base probability multiplier based on tier
    tier_multiplier = {"premium": 1.3, "mid": 1.0, "budget": 0.7}[tier]
    bhk_multiplier = min(1 + (bhk - 1) * 0.1, 1.5)  # More BHK = more amenities likely

    for amenity, base_prob in AMENITIES:
        prob = base_prob * tier_multiplier * bhk_multiplier
        if random.random() < min(prob, 0.95):
            selected.append(amenity)

    # Ensure at least some basic amenities
    if not selected:
        selected = ["parking", "security"]

    return selected


def generate_title(bhk: int, tier: str, area_name: str) -> str:
    """Generate a property title."""
    # Select title style based on tier
    if tier == "premium":
        style = random.choice(["luxury", "modern"])
    elif tier == "mid":
        style = random.choice(["modern", "family"])
    else:
        style = random.choice(["budget", "family"])

    if bhk == 1:
        style = "studio" if random.random() < 0.4 else style

    templates = TITLE_TEMPLATES.get(style, TITLE_TEMPLATES["modern"])
    template = random.choice(templates)

    prop_type = random.choice(PROPERTY_TYPES[bhk])

    # Some templates need area name, some don't
    if "{}" in template and template.count("{}") == 2:
        return template.format(prop_type, area_name)
    elif "{}" in template:
        return template.format(area_name)
    return template


def generate_price(sqft: int, tier: str, city_multiplier: float) -> float:
    """Generate realistic price in lakhs."""
    min_ppsf, max_ppsf = BASE_PRICE_PER_SQFT[tier]
    price_per_sqft = random.uniform(min_ppsf, max_ppsf)

    # Total price in rupees
    total_price = sqft * price_per_sqft * city_multiplier

    # Convert to lakhs
    price_lakhs = total_price / 100000

    # Round to reasonable values
    if price_lakhs < 50:
        return round(price_lakhs, 1)
    elif price_lakhs < 200:
        return round(price_lakhs / 5) * 5  # Round to nearest 5
    else:
        return round(price_lakhs / 10) * 10  # Round to nearest 10


def jitter_coordinates(lat: float, lng: float, radius_km: float = 2.0) -> tuple[float, float]:
    """Add small random offset to coordinates to spread properties within area."""
    # 1 degree of latitude ≈ 111 km
    lat_offset = random.uniform(-radius_km, radius_km) / 111
    lng_offset = random.uniform(-radius_km, radius_km) / 111

    return (
        round(lat + lat_offset, 6),
        round(lng + lng_offset, 6),
    )


def generate_properties(city: str, count: int = 75) -> list[dict]:
    """Generate property data for a city."""
    if city not in CITY_DATA:
        raise ValueError(f"Unknown city: {city}. Available: {list(CITY_DATA.keys())}")

    city_info = CITY_DATA[city]
    properties = []

    for _ in range(count):
        # Select BHK based on distribution
        bhk = weighted_choice(BHK_DISTRIBUTION)

        # Select area (with some randomness favoring mid-tier)
        area = random.choice(city_info["areas"])

        # Generate size
        min_sqft, max_sqft = SIZE_RANGES[bhk]
        sqft = random.randint(min_sqft, max_sqft)

        # Generate bathrooms (usually bhk or bhk+1)
        bathrooms = min(bhk + random.randint(0, 1), bhk + 2)

        # Generate price
        price_lakhs = generate_price(sqft, area.tier, city_info["price_multiplier"])

        # Generate amenities
        amenities = generate_amenities(bhk, area.tier)

        # Generate title
        title = generate_title(bhk, area.tier, area.name)

        # Jitter coordinates
        lat, lng = jitter_coordinates(area.lat, area.lng)

        properties.append({
            "title": title,
            "area": area.name,
            "bhk": bhk,
            "sqft": sqft,
            "bathrooms": bathrooms,
            "price_lakhs": price_lakhs,
            "amenities": "|".join(amenities),
            "latitude": lat,
            "longitude": lng,
        })

    return properties


def write_csv(city: str, properties: list[dict], output_dir: Path):
    """Write properties to CSV file."""
    city_dir = output_dir / city
    city_dir.mkdir(parents=True, exist_ok=True)

    csv_path = city_dir / "housing.csv"

    fieldnames = ["title", "area", "bhk", "sqft", "bathrooms", "price_lakhs", "amenities", "latitude", "longitude"]

    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(properties)

    print(f"Generated {len(properties)} properties for {city} at {csv_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate realistic property data")
    parser.add_argument("--city", help="City to generate data for (bangalore, mumbai, delhi)")
    parser.add_argument("--all", action="store_true", help="Generate data for all cities")
    parser.add_argument("--count", type=int, default=75, help="Number of properties per city (default: 75)")
    parser.add_argument("--output", type=Path, default=Path(__file__).parent.parent / "data",
                        help="Output directory (default: data/)")
    args = parser.parse_args()

    if not args.city and not args.all:
        parser.error("Either --city or --all must be specified")

    cities = list(CITY_DATA.keys()) if args.all else [args.city.lower()]

    for city in cities:
        properties = generate_properties(city, args.count)
        write_csv(city, properties, args.output)

    print(f"\nDone! Generated {args.count * len(cities)} total properties.")


if __name__ == "__main__":
    main()
