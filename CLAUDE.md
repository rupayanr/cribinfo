# CLAUDE.md — CribInfo

## Project Overview

Housing search powered by RAG. Natural language queries like "2BHK under 1Cr with gym" return relevant property recommendations. Starting with Bangalore, extensible to other cities.

**Owner:** Rupayan Roy  
**Timeline:** Weeks 10–11 (Mar 24 – Apr 6)  
**Live URL:** cribinfo.rupayan.dev (planned)  
**Design Doc:** `docs/cribinfo-design.md`

---

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Leaflet + React-Leaflet (maps)
- Tailwind CSS
- Zustand (state)

### Backend
- Python 3.11+
- FastAPI (async)
- PostgreSQL + pgvector
- Ollama (local LLMs + embeddings)
- SQLAlchemy 2.0 (async)

### Infrastructure
- Vercel (frontend)
- Railway (backend)
- Neon (PostgreSQL with pgvector)

---

## Project Structure

```
cribinfo/
├── CLAUDE.md
├── README.md
├── docs/
│   └── cribinfo-design.md
├── frontend/
│   ├── package.json
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── Search/
│       │   │   ├── SearchBar.tsx
│       │   │   ├── Filters.tsx
│       │   │   └── CitySelector.tsx
│       │   ├── Property/
│       │   │   ├── PropertyCard.tsx
│       │   │   ├── PropertyGrid.tsx
│       │   │   └── CompareView.tsx
│       │   └── Map/
│       │       └── PropertyMap.tsx
│       ├── hooks/
│       │   ├── useSearch.ts
│       │   └── useCompare.ts
│       └── stores/
│           └── searchStore.ts
└── backend/
    ├── requirements.txt
    ├── Dockerfile
    ├── scripts/
    │   ├── load_data.py
    │   ├── generate_data.py       # NEW: Generate realistic data
    │   └── generate_embeddings.py
    ├── data/
    │   ├── bangalore/
    │   │   └── housing.csv
    │   ├── mumbai/
    │   │   └── housing.csv
    │   └── delhi/
    │       └── housing.csv
    └── app/
        ├── main.py
        ├── config.py
        ├── api/
        │   └── routes/
        │       ├── search.py
        │       ├── properties.py
        │       └── cities.py
        ├── core/
        │   ├── embeddings.py
        │   ├── query_parser.py
        │   └── search_engine.py
        ├── models/
        │   └── property.py
        └── repositories/
            └── property_repo.py
```

---

## Multi-City Architecture

```python
# Properties table supports multiple cities
class Property(Base):
    id: UUID
    city: str  # "bangalore", "mumbai", "delhi", etc.
    area: str
    # ... rest of fields
```

```python
# Search endpoint accepts city
@router.post("/search")
async def search(query: str, city: str = "bangalore"):
    ...
```

---

## RAG Pipeline

1. **User query** → "2BHK under 1Cr gym"
2. **Parse query** (Ollama llama3.2) → Extract: bhk=2, max_price=100, amenities=[gym]
3. **Generate embedding** → Ollama nomic-embed-text (768 dims)
4. **Hybrid search** → Vector similarity + SQL filters + city filter
5. **Rank & return** → Top 10 results

---

## API Endpoints

```
POST /api/v1/search              # NLP search (with city param)
GET  /api/v1/properties/{id}     # Property details
POST /api/v1/compare             # Compare properties
GET  /api/v1/cities              # List available cities
GET  /api/v1/cities/{city}/areas # Areas in a city
```

---

## Database Schema

```sql
CREATE TABLE properties (
    id UUID PRIMARY KEY,
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
    embedding vector(768)  -- nomic-embed-text dimensions
);

CREATE INDEX idx_properties_city ON properties(city);
```

---

## Key Dependencies

### Frontend
```json
{
  "react-leaflet": "^4.2",
  "leaflet": "^1.9",
  "zustand": "^4.5"
}
```

### Backend
```
fastapi>=0.109.0
uvicorn[standard]>=0.27.0
sqlalchemy[asyncio]>=2.0.0
asyncpg>=0.29.0
pgvector>=0.2.0
ollama>=0.4.0
```

---

## Commands

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Load data (one-time, per city)
python scripts/load_data.py --city bangalore

uvicorn app.main:app --reload
```

---

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/cribinfo

# Environment (affects CORS, credentials)
ENVIRONMENT=development  # "development" or "production"

# Provider selection
LLM_PROVIDER=ollama      # "ollama" or "groq"
EMBEDDING_PROVIDER=ollama # "ollama" or "jina" or "none"

# Ollama settings (local development)
OLLAMA_HOST=http://localhost:11434
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=llama3.2

# Production providers
GROQ_API_KEY=gsk-...
JINA_API_KEY=jina_...

# CORS (auto-switches in production)
CORS_ORIGINS=["http://localhost:5173"]
CORS_ORIGINS_PRODUCTION=["https://cribinfo.rupayan.dev"]

DEFAULT_CITY=bangalore
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:8000
```

### Frontend (.env.production)
```
VITE_API_URL=https://api.cribinfo.rupayan.dev
```

---

## Adding a New City

1. Add dataset to `data/{city}/housing.csv`
2. Run `python scripts/load_data.py --city {city}`
3. City auto-appears in dropdown

---

## Data Sources

| City | Properties | Source |
|------|------------|--------|
| Bangalore | 75 | Generated via `generate_data.py` |
| Mumbai | 75 | Generated via `generate_data.py` |
| Delhi | 75 | Generated via `generate_data.py` |

---

## Scripts

| Script | Description |
|--------|-------------|
| `load_data.py` | Load CSV data into database |
| `generate_data.py` | Generate realistic property data |
| `generate_embeddings.py` | Generate vector embeddings |

### Generate Data
```bash
# Generate 75 properties per city (all cities)
python scripts/generate_data.py --all --count 75

# Generate for single city
python scripts/generate_data.py --city bangalore --count 100
```

---

## Security Features

| Feature | Implementation |
|---------|----------------|
| **CSP** | No `unsafe-eval`, inline scripts only |
| **HSTS** | 1 year max-age with preload |
| **Rate Limiting** | 30/min (search), 60/min (other) |
| **CORS** | Restricted to production domain |
| **Error Sanitization** | No raw errors exposed to users |
| **Security Headers** | X-Frame-Options, X-XSS-Protection, etc. |

---

## Milestones

- [x] Week 10: Data loading, embeddings, RAG search
- [x] Week 11: UI, map view, compare feature, deploy
- [x] Security: CSP, HSTS, rate limiting, CORS hardening

---

*Last updated: February 2026*
