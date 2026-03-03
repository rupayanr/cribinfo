# CribInfo

Housing search powered by AI. Search for properties using natural language across multiple cities.

## Features

- **Natural Language Search** - Query like "2BHK under 1Cr with gym"
- **Smart Filters** - Auto-extracts BHK, price, area, amenities
- **Map View** - See properties on an interactive map
- **Compare** - Side-by-side property comparison
- **Multi-City** - Bangalore, Mumbai, Delhi supported
- **Secure** - Rate limiting, HTTPS, CSP protection

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, TypeScript, Leaflet, Tailwind |
| Backend | FastAPI, PostgreSQL, pgvector |
| AI | Ollama/Groq LLM + Jina/Ollama Embeddings |
| Hosting | Vercel (FE), Render (BE), Neon (DB) |

## Architecture

### System Overview

```
+----------------+     +------------------+     +-------------------+
|                |     |                  |     |                   |
|  React SPA     +---->+  FastAPI Backend +---->+  PostgreSQL       |
|  (Vercel)      |     |  (Render)        |     |  + pgvector       |
|                |     |                  |     |  (Neon)           |
+----------------+     +--------+---------+     +-------------------+
                                |
                                v
                 +--------------+--------------+
                 |                             |
         +-------v-------+           +---------v---------+
         |               |           |                   |
         |  LLM Provider |           | Embedding Provider|
         |  (Groq/Ollama)|           | (Jina AI/Ollama)  |
         |               |           |                   |
         +---------------+           +-------------------+
```

### RAG Pipeline

```
User Query: "2BHK under 1Cr with gym"
                    |
                    v
    +-------------------------------+
    |       Query Parser (LLM)      |
    |  Extract: bhk=2, max_price=100|
    |           amenities=[gym]     |
    +---------------+---------------+
                    |
                    v
    +-------------------------------+
    |     Embedding Generator       |
    |     768-dim vector            |
    +---------------+---------------+
                    |
                    v
    +-------------------------------+
    |       Hybrid Search           |
    |  Vector similarity + SQL      |
    +---------------+---------------+
                    |
                    v
            Top 10 Results
```

### Search Strategy (Filter Relaxation)

```
+-------------------+
| Exact Match       |  All filters + vector similarity
+---------+---------+
          | No results
          v
+---------+---------+
| Relax BHK         |  Keep area + price
+---------+---------+
          | No results
          v
+---------+---------+
| Relax Area        |  Keep BHK + price
+---------+---------+
          | No results
          v
+---------+---------+
| Price Only        |  Keep city + price range
+---------+---------+
          | No results
          v
+---------+---------+
| Semantic Fallback |  Pure vector similarity
+-------------------+
```

### Backend Module Structure

```
backend/
  app/
    api/
      routes/
        search.py        POST /api/v1/search
        properties.py    GET  /api/v1/properties/{id}
        cities.py        GET  /api/v1/cities
    core/
      query_parser.py    LLM-based filter extraction
      search_engine.py   Hybrid search logic
      embeddings.py      Vector generation
    providers/
      llm.py             Groq / Ollama abstraction
      embeddings.py      Jina AI / Ollama abstraction
    models/
      property.py        SQLAlchemy model
      database.py        Connection pool
    repositories/
      property_repo.py   Data access layer
```

### Frontend Component Tree

```
App
 |-- Layout
      |-- Header
      |    |-- CitySelector
      |    |-- ThemeToggle
      |
      |-- HomePage
           |-- ChatContainer
           |    |-- WelcomeMessage
           |    |-- ChatMessage
           |    |    |-- FilterBadges
           |    |    |-- MessagePropertyCard
           |    |    |-- ChatMapWidget
           |    |-- ChatInput
           |    |-- TypingIndicator
           |
           |-- CompareView
```

### Database Schema

```
+------------------+
|    properties    |
+------------------+
| id         UUID  |  PK
| city       VARCHAR|
| title      VARCHAR|
| area       VARCHAR|
| bhk        INT    |
| sqft       INT    |
| bathrooms  INT    |
| price_lakhs DECIMAL|
| amenities  TEXT[] |
| latitude   DECIMAL|
| longitude  DECIMAL|
| embedding  VECTOR |  768 dimensions
+------------------+
```

## Quick Start

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Set environment variables (see .env.example)
cp .env.example .env

# Load data
python scripts/load_data.py --all

# Start server
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/search | Natural language property search |
| GET | /api/v1/properties/{id} | Get property details |
| POST | /api/v1/compare | Compare multiple properties |
| GET | /api/v1/cities | List available cities |
| GET | /api/v1/cities/{city}/areas | List areas in a city |

## Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql+asyncpg://...
ENVIRONMENT=development
LLM_PROVIDER=ollama
EMBEDDING_PROVIDER=ollama
GROQ_API_KEY=gsk_...
JINA_API_KEY=jina_...
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8000
```

## Sample Searches

- "3BHK in Koramangala with pool"
- "Apartment near tech park under 50 lakhs"
- "Family home with parking"
- "Studio in city center"

## Available Cities

- Bangalore (75 listings)
- Mumbai (75 listings)
- Delhi (75 listings)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment guide using free tier services.

## License

MIT

---

Made by [Rupayan Roy](https://linkedin.com/in/rupayan-roy)
