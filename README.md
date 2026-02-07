# CribInfo

Housing search powered by AI. Search for properties using natural language across multiple cities.

![CribInfo Preview](preview.png)

## ✨ Features

- **Natural Language Search** — "2BHK under 1Cr with gym"
- **Smart Filters** — Auto-extracts BHK, price, area, amenities
- **Map View** — See properties on an interactive map
- **Compare** — Side-by-side property comparison (Cards & Table views)
- **Multi-City** — Bangalore, Mumbai, Delhi supported
- **Secure** — Rate limiting, HTTPS, CSP protection

## 🛠 Tech Stack

**Frontend:** React, TypeScript, Leaflet, Tailwind
**Backend:** FastAPI, PostgreSQL, pgvector
**AI:** Ollama/Groq LLM + Jina/Ollama Embeddings

## 🏙️ Available Cities

- [x] Bangalore (75 listings)
- [x] Mumbai (75 listings)
- [x] Delhi (75 listings)

## 🚀 Quick Start

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL=postgresql+asyncpg://...
export OPENAI_API_KEY=sk-...

# Load data
python scripts/load_data.py --city bangalore

# Start server
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🔍 How It Works

```
"2BHK under 1Cr gym"
         │
         ▼
┌─────────────────────┐
│  GPT-4 Query Parser │
│  bhk=2, max=100,    │
│  amenities=[gym]    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Vector Similarity  │
│  + SQL Filters      │
└──────────┬──────────┘
           │
           ▼
    Top 10 Results
```

## 📁 Project Structure

```
cribinfo/
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Search/
│       │   ├── Property/
│       │   └── Map/
│       └── hooks/
└── backend/
    ├── app/
    │   ├── api/
    │   └── core/
    ├── scripts/
    └── data/
```

## 🔧 Environment Variables

**Backend (.env):**
```
DATABASE_URL=postgresql+asyncpg://...
ENVIRONMENT=development  # or "production"
LLM_PROVIDER=ollama      # or "groq"
EMBEDDING_PROVIDER=ollama # or "jina"
GROQ_API_KEY=gsk-...     # for production
JINA_API_KEY=jina_...    # for production embeddings
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:8000
```

**Production Notes:**
- HTTPS is enforced via HSTS headers
- CORS is restricted to production domain
- Rate limiting: 30 req/min (search), 60 req/min (other endpoints)

## 📊 API

```
POST /api/v1/search          # NLP property search
GET  /api/v1/properties/{id} # Property details
POST /api/v1/compare         # Compare properties
GET  /api/v1/cities          # Available cities
```

## 🗺️ Sample Searches

- "3BHK in Koramangala with pool"
- "Apartment near tech park under 50 lakhs"
- "Family home with parking"
- "Studio in city center"

## 📝 License

MIT

---

Made with ❤️ by [Rupayan Roy](https://linkedin.com/in/rupayan-roy)
