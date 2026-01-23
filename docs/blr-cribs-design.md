# BLR Cribs — System Design Document

## Overview

**BLR Cribs** is a Bangalore housing search agent powered by RAG. Ask natural language questions like "2BHK in Whitefield under 1Cr with gym" and get relevant property recommendations.

**Why this project?**  
Demonstrates RAG pipeline expertise, embeddings, pgvector, and creates something genuinely useful and relatable. Local Bangalore angle adds authenticity.

---

## Features

### MVP (Must Have)

- [ ] Natural language property search
- [ ] Filter by location, price, size, amenities
- [ ] Property cards with key details
- [ ] Map view showing property locations
- [ ] Compare properties side-by-side

### Nice to Have (Post-MVP)

- [ ] Save favorites
- [ ] Price trend insights by area
- [ ] Commute time calculator
- [ ] Similar property recommendations
- [ ] Share search results

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Search    │  │  Property   │  │        Map          │  │
│  │    Bar      │  │   Cards     │  │      (Leaflet)      │  │
│  └──────┬──────┘  └──────▲──────┘  └──────────▲──────────┘  │
│         │                │                     │             │
│         │         ┌──────┴─────────────────────┘             │
│         │         │                                          │
│         ▼         │                                          │
│  ┌────────────────┴─────────────────────────────────────┐   │
│  │                     REST API Client                   │   │
│  └──────────────────────────┬───────────────────────────┘   │
└─────────────────────────────┼───────────────────────────────┘
                              │
                         HTTP/REST
                              │
┌─────────────────────────────▼───────────────────────────────┐
│                        BACKEND                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   FastAPI Server                     │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │    │
│  │  │   Search    │  │    RAG      │  │   Property  │  │    │
│  │  │   Endpoint  │  │   Pipeline  │  │   CRUD      │  │    │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  │    │
│  └─────────┼────────────────┼────────────────┼─────────┘    │
│            │                │                │               │
│            ▼                ▼                ▼               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              PostgreSQL + pgvector                    │   │
│  │   ┌─────────────┐    ┌─────────────────────────┐     │   │
│  │   │ Properties  │    │  Property Embeddings    │     │   │
│  │   │   Table     │    │     (1536 dims)         │     │   │
│  │   └─────────────┘    └─────────────────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Reasoning |
|-------|------------|-----------|
| Frontend | React + TypeScript | Consistency |
| Maps | Leaflet + React-Leaflet | Free, no API key |
| Backend | FastAPI | Async, fast |
| Database | PostgreSQL + pgvector | Vector similarity search |
| Embeddings | OpenAI text-embedding-3-small | Good quality, cheap |
| Data | Kaggle Bangalore Housing Dataset | Clean, ~13k records |
| Hosting | Vercel + Railway | Free tiers |

---

## Data Model

### Source Data (Kaggle)

The dataset includes:
- Location (area name)
- Size (BHK count)
- Total square feet
- Bath count
- Price (in lakhs)
- Availability

### Enhanced Property Schema

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Basic info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Location
    area VARCHAR(100) NOT NULL,
    city VARCHAR(50) DEFAULT 'Bangalore',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Property details
    bhk INTEGER NOT NULL,
    bathrooms INTEGER,
    sqft INTEGER,
    price_lakhs DECIMAL(10, 2) NOT NULL,
    price_per_sqft DECIMAL(10, 2),
    
    -- Amenities (derived/enriched)
    amenities TEXT[],  -- ['gym', 'pool', 'parking', etc.]
    
    -- Metadata
    availability VARCHAR(50),
    source VARCHAR(50) DEFAULT 'kaggle',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Vector embedding
    embedding vector(1536)
);

-- Indexes
CREATE INDEX idx_properties_area ON properties(area);
CREATE INDEX idx_properties_bhk ON properties(bhk);
CREATE INDEX idx_properties_price ON properties(price_lakhs);
CREATE INDEX idx_properties_embedding ON properties 
    USING ivfflat (embedding vector_cosine_ops);
```

---

## RAG Pipeline

### 1. Query Processing

```
User: "2BHK in Whitefield under 1Cr with gym"
           │
           ▼
┌─────────────────────────┐
│   Query Parser (LLM)    │
│   Extract:              │
│   - bhk: 2              │
│   - area: Whitefield    │
│   - max_price: 100      │
│   - amenities: [gym]    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Generate Embedding    │
│   (text-embedding-3)    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Hybrid Search         │
│   - Vector similarity   │
│   - SQL filters         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│   Rank & Return Top 10  │
└─────────────────────────┘
```

### 2. Embedding Strategy

Each property is embedded as a text description:

```python
def create_property_text(property: Property) -> str:
    return f"""
    {property.bhk} BHK apartment in {property.area}, Bangalore.
    {property.sqft} sq ft, {property.bathrooms} bathrooms.
    Price: {property.price_lakhs} lakhs ({property.price_per_sqft} per sqft).
    Amenities: {', '.join(property.amenities)}.
    {property.description}
    """
```

### 3. Hybrid Search Query

```sql
WITH query_embedding AS (
    SELECT $1::vector AS embedding
),
filtered AS (
    SELECT * FROM properties
    WHERE 
        ($2::integer IS NULL OR bhk = $2)
        AND ($3::decimal IS NULL OR price_lakhs <= $3)
        AND ($4::text IS NULL OR area ILIKE '%' || $4 || '%')
        AND ($5::text[] IS NULL OR amenities && $5)
)
SELECT 
    f.*,
    1 - (f.embedding <=> q.embedding) AS similarity
FROM filtered f, query_embedding q
ORDER BY similarity DESC
LIMIT 10;
```

---

## API Specification

### Search Properties

```
POST /api/v1/search

Request:
{
  "query": "2BHK in Whitefield under 1Cr with gym",
  "filters": {
    "bhk": 2,           // optional
    "max_price": 100,   // optional, in lakhs
    "min_price": 50,    // optional
    "area": "Whitefield", // optional
    "amenities": ["gym", "pool"] // optional
  },
  "limit": 10
}

Response:
{
  "results": [
    {
      "id": "uuid",
      "title": "2BHK in Prestige Lakeside",
      "area": "Whitefield",
      "bhk": 2,
      "sqft": 1200,
      "price_lakhs": 85,
      "amenities": ["gym", "pool", "parking"],
      "latitude": 12.9716,
      "longitude": 77.7499,
      "similarity": 0.89
    }
  ],
  "total": 45,
  "query_parsed": {
    "bhk": 2,
    "area": "Whitefield",
    "max_price": 100,
    "amenities": ["gym"]
  }
}
```

### Get Property Details

```
GET /api/v1/properties/{id}

Response:
{
  "id": "uuid",
  "title": "...",
  "description": "...",
  "area": "...",
  // ... full property object
}
```

### Compare Properties

```
POST /api/v1/compare

Request:
{
  "property_ids": ["uuid1", "uuid2", "uuid3"]
}

Response:
{
  "properties": [...],
  "comparison": {
    "price_range": { "min": 75, "max": 95 },
    "avg_price_per_sqft": 7500,
    "common_amenities": ["parking"],
    "unique_amenities": {
      "uuid1": ["gym"],
      "uuid2": ["pool"]
    }
  }
}
```

### Get Areas

```
GET /api/v1/areas

Response:
{
  "areas": [
    { "name": "Whitefield", "count": 245, "avg_price": 85 },
    { "name": "Koramangala", "count": 189, "avg_price": 120 },
    ...
  ]
}
```

---

## Frontend Structure

```
blr-cribs/frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Search/
│   │   │   ├── SearchBar.tsx         # NLP search input
│   │   │   ├── Filters.tsx           # Filter sidebar
│   │   │   └── SearchSuggestions.tsx # Autocomplete
│   │   ├── Property/
│   │   │   ├── PropertyCard.tsx      # Result card
│   │   │   ├── PropertyGrid.tsx      # Grid layout
│   │   │   ├── PropertyDetail.tsx    # Full details modal
│   │   │   └── CompareView.tsx       # Side-by-side
│   │   ├── Map/
│   │   │   ├── PropertyMap.tsx       # Leaflet map
│   │   │   └── MapMarker.tsx         # Custom markers
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── SplitLayout.tsx       # List | Map
│   ├── hooks/
│   │   ├── useSearch.ts
│   │   ├── useProperties.ts
│   │   └── useCompare.ts
│   ├── lib/
│   │   └── api.ts                    # API client
│   ├── stores/
│   │   ├── searchStore.ts
│   │   └── compareStore.ts
│   └── types/
│       └── index.ts
├── package.json
└── ...
```

---

## Backend Structure

```
blr-cribs/backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── routes/
│   │   │   ├── search.py
│   │   │   ├── properties.py
│   │   │   └── areas.py
│   │   └── deps.py
│   ├── core/
│   │   ├── embeddings.py           # OpenAI embedding client
│   │   ├── query_parser.py         # LLM query parsing
│   │   └── search_engine.py        # Hybrid search logic
│   ├── models/
│   │   └── property.py
│   ├── schemas/
│   │   └── property.py
│   ├── repositories/
│   │   └── property_repo.py
│   └── services/
│       └── search_service.py
├── scripts/
│   ├── load_data.py                # Load Kaggle CSV
│   └── generate_embeddings.py      # Batch embed all properties
├── data/
│   └── bangalore_housing.csv       # Kaggle dataset
├── requirements.txt
└── Dockerfile
```

---

## Data Loading Script

```python
# scripts/load_data.py
import pandas as pd
from app.models.property import Property
from app.core.embeddings import get_embedding

def load_kaggle_data(csv_path: str):
    df = pd.read_csv(csv_path)
    
    for _, row in df.iterrows():
        # Create property text for embedding
        text = create_property_text(row)
        embedding = get_embedding(text)
        
        property = Property(
            area=row['location'],
            bhk=row['size'],  # "2 BHK" -> 2
            sqft=row['total_sqft'],
            bathrooms=row['bath'],
            price_lakhs=row['price'],
            embedding=embedding,
            # Enrich with geocoding, amenities, etc.
        )
        
        db.add(property)
    
    db.commit()
```

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| No results | Show "No properties found" + suggest broader search |
| Invalid query | Parse what we can, show clarification |
| Geocoding fails | Skip map pin, show in list |
| API rate limit | Queue and retry |

---

## Testing Strategy

### Unit Tests
- Query parser extraction
- Embedding generation
- Search ranking logic

### Integration Tests
- Full search flow
- Filter combinations
- Comparison feature

### Data Quality Tests
- Embedding coverage (all properties embedded)
- Geocoding coverage
- Price sanity checks

---

## Deployment

### Environment Variables

```bash
# Backend
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/blrcribs
OPENAI_API_KEY=sk-...
CORS_ORIGINS=["https://blrcribs.yourdomain.com"]

# Frontend
VITE_API_URL=https://api.blrcribs.yourdomain.com
```

---

## Cost Estimation

| Service | Usage | Cost |
|---------|-------|------|
| OpenAI Embeddings | ~13k properties × $0.00002 | ~$0.26 one-time |
| OpenAI Query Parse | ~$0.001/query | ~$1/month |
| Neon PostgreSQL | Free tier | $0 |
| Railway | Hobby tier | $0 |
| Vercel | Free tier | $0 |

---

## Milestones

| Week | Goal | Deliverable |
|------|------|-------------|
| 10 | Data + RAG pipeline | NLP search working |
| 11 | UI + Map + Deploy | **BLR Cribs shipped** |

---

## Resources

- [Kaggle Dataset](https://www.kaggle.com/datasets/amitabhajoy/bengaluru-house-price-data)
- [pgvector Docs](https://github.com/pgvector/pgvector)
- [Leaflet Docs](https://leafletjs.com/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)

---

*Last updated: January 2025*
