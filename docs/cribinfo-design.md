# CribInfo — System Design Document

## Overview

**CribInfo** is a housing search platform powered by RAG. Ask natural language questions like "2BHK under 1Cr with gym" and get relevant property recommendations. Multi-city support built in from day one.

**Why this project?**  
Demonstrates RAG pipeline expertise, embeddings, pgvector, and creates something genuinely useful. Multi-city architecture shows scalable thinking.

---

## Features

### MVP (Must Have)

- [ ] Natural language property search
- [ ] Filter by location, price, size, amenities
- [ ] Property cards with key details
- [ ] Map view showing property locations
- [ ] Compare properties side-by-side
- [ ] City selector (start with Bangalore)

### Nice to Have (Post-MVP)

- [ ] Save favorites
- [ ] Price trend insights by area
- [ ] Commute time calculator
- [ ] Similar property recommendations
- [ ] More cities (Mumbai, Delhi, etc.)

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
│  ┌──────┴────────────────┴─────────────────────┘             │
│  │                 REST API Client                           │
│  └──────────────────────────┬───────────────────────────────┘
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
│  │   │ (by city)   │    │     (1536 dims)         │     │   │
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
| Hosting | Vercel + Railway | Free tiers |

---

## Data Model

### Property Schema

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- City (for multi-city support)
    city VARCHAR(50) NOT NULL,
    
    -- Basic info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Location
    area VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Property details
    bhk INTEGER NOT NULL,
    bathrooms INTEGER,
    sqft INTEGER,
    price_lakhs DECIMAL(10, 2) NOT NULL,
    price_per_sqft DECIMAL(10, 2),
    
    -- Amenities
    amenities TEXT[],
    
    -- Metadata
    availability VARCHAR(50),
    source VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Vector embedding
    embedding vector(1536)
);

-- Indexes
CREATE INDEX idx_properties_city ON properties(city);
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
User: "2BHK under 1Cr with gym"
           │
           ▼
┌─────────────────────────┐
│   Query Parser (LLM)    │
│   Extract:              │
│   - bhk: 2              │
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
│   - City filter         │
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

```python
def create_property_text(property: Property) -> str:
    return f"""
    {property.bhk} BHK apartment in {property.area}, {property.city}.
    {property.sqft} sq ft, {property.bathrooms} bathrooms.
    Price: {property.price_lakhs} lakhs.
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
        city = $2
        AND ($3::integer IS NULL OR bhk = $3)
        AND ($4::decimal IS NULL OR price_lakhs <= $4)
        AND ($5::text IS NULL OR area ILIKE '%' || $5 || '%')
        AND ($6::text[] IS NULL OR amenities && $6)
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
  "query": "2BHK under 1Cr with gym",
  "city": "bangalore",
  "filters": {
    "bhk": 2,
    "max_price": 100,
    "min_price": 50,
    "area": "Whitefield",
    "amenities": ["gym", "pool"]
  },
  "limit": 10
}

Response:
{
  "results": [...],
  "total": 45,
  "city": "bangalore",
  "query_parsed": {
    "bhk": 2,
    "max_price": 100,
    "amenities": ["gym"]
  }
}
```

### Get Available Cities

```
GET /api/v1/cities

Response:
{
  "cities": [
    { "id": "bangalore", "name": "Bangalore", "count": 13000 },
    { "id": "mumbai", "name": "Mumbai", "count": 0, "coming_soon": true }
  ]
}
```

### Get Areas in City

```
GET /api/v1/cities/{city}/areas

Response:
{
  "areas": [
    { "name": "Whitefield", "count": 245, "avg_price": 85 },
    { "name": "Koramangala", "count": 189, "avg_price": 120 }
  ]
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
    "common_amenities": ["parking"],
    "unique_amenities": {...}
  }
}
```

---

## Frontend Structure

```
cribinfo/frontend/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── Search/
│   │   │   ├── SearchBar.tsx
│   │   │   ├── Filters.tsx
│   │   │   └── CitySelector.tsx
│   │   ├── Property/
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyGrid.tsx
│   │   │   ├── PropertyDetail.tsx
│   │   │   └── CompareView.tsx
│   │   ├── Map/
│   │   │   ├── PropertyMap.tsx
│   │   │   └── MapMarker.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       └── SplitLayout.tsx
│   ├── hooks/
│   │   ├── useSearch.ts
│   │   ├── useProperties.ts
│   │   └── useCompare.ts
│   ├── lib/
│   │   └── api.ts
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
cribinfo/backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── api/
│   │   ├── routes/
│   │   │   ├── search.py
│   │   │   ├── properties.py
│   │   │   └── cities.py
│   │   └── deps.py
│   ├── core/
│   │   ├── embeddings.py
│   │   ├── query_parser.py
│   │   └── search_engine.py
│   ├── models/
│   │   └── property.py
│   ├── schemas/
│   │   └── property.py
│   ├── repositories/
│   │   └── property_repo.py
│   └── services/
│       └── search_service.py
├── scripts/
│   ├── load_data.py
│   └── generate_embeddings.py
├── data/
│   └── bangalore/
│       └── housing.csv
├── requirements.txt
└── Dockerfile
```

---

## Adding a New City

1. Create `data/{city}/housing.csv` with same schema
2. Run `python scripts/load_data.py --city {city}`
3. Embeddings generated automatically
4. City appears in `/api/v1/cities` response
5. Frontend dropdown updates automatically

---

## Cost Estimation

| Service | Usage | Cost |
|---------|-------|------|
| OpenAI Embeddings | ~13k properties × $0.00002 | ~$0.26 one-time per city |
| OpenAI Query Parse | ~$0.001/query | ~$1/month |
| Neon PostgreSQL | Free tier | $0 |
| Railway | Hobby tier | $0 |
| Vercel | Free tier | $0 |

---

## Milestones

| Week | Goal | Deliverable |
|------|------|-------------|
| 10 | Data + RAG pipeline | NLP search working |
| 11 | UI + Map + Deploy | **CribInfo shipped** |

---

*Last updated: January 2025*
