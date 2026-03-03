# CribInfo Deployment Guide - Free Tier Stack

Deploy CribInfo using 100% free tier services with zero monthly cost.

## Stack Overview

| Service | Provider | Free Tier Limits |
|---------|----------|------------------|
| Frontend | Vercel | Unlimited (hobby) |
| Backend | Render | 750 hrs/month, sleeps after 15min |
| Database | Neon | 0.5GB storage, pgvector included |
| LLM | Groq | 30 req/min, 6000/day |
| Embeddings | Jina AI | 1M tokens/month |

---

## Step 1: Set Up Neon Database (PostgreSQL + pgvector)

1. Go to https://neon.tech and sign up (GitHub login works)
2. Create a new project called `cribinfo`
3. In the dashboard, copy the connection string:
   ```
   postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
4. Convert to asyncpg format for the backend:
   ```
   postgresql+asyncpg://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?ssl=require
   ```
5. Run the SQL to enable pgvector (in Neon SQL Editor):
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

**Free Tier**: 0.5GB storage, 1 project, auto-suspend after 5 min inactivity

---

## Step 2: Get API Keys

### Groq (LLM)
1. Go to https://console.groq.com
2. Sign up and create an API key
3. Copy `gsk_...` key

**Free Tier**: 30 requests/minute, 6000/day, 30K tokens/min

### Jina AI (Embeddings)
1. Go to https://jina.ai/embeddings
2. Sign up and get API key
3. Copy `jina_...` key

**Free Tier**: 1M tokens/month (sufficient for 225 properties)

---

## Step 3: Deploy Backend to Render

1. Go to https://render.com and connect GitHub
2. Create "New Web Service" -> Connect `cribinfo` repo
3. Configure:
   - **Name**: `cribinfo-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

4. Add Environment Variables:
   ```
   ENVIRONMENT=production
   LLM_PROVIDER=groq
   EMBEDDING_PROVIDER=jina
   DATABASE_URL=postgresql+asyncpg://...  (from Step 1)
   GROQ_API_KEY=gsk_...  (from Step 2)
   JINA_API_KEY=jina_...  (from Step 2)
   CORS_ORIGINS=["https://cribinfo.vercel.app"]
   DEFAULT_CITY=bangalore
   ```

5. Deploy - Render will build and start the service
6. Note the URL: `https://cribinfo-api.onrender.com`

**Free Tier**: 750 hours/month, spins down after 15 min inactivity (cold start ~30s)

---

## Step 4: Load Data into Database

After backend deploys, load the property data locally with production DB:

```bash
cd backend
source .venv/bin/activate

# Set production environment variables temporarily
export DATABASE_URL="postgresql+asyncpg://..."
export EMBEDDING_PROVIDER=jina
export JINA_API_KEY=jina_...

# Load all cities (alternative: --city bangalore for single city)
python scripts/load_data.py --all

# Generate embeddings for all cities
python scripts/generate_embeddings.py --all
```

---

## Step 5: Deploy Frontend to Vercel

1. Go to https://vercel.com and connect GitHub
2. Import `cribinfo` repository
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://cribinfo-api.onrender.com
   ```

5. Deploy - Vercel will build and deploy
6. Note URL: `https://cribinfo.vercel.app`

**Free Tier**: Unlimited deployments, 100GB bandwidth

---

## Step 6: Update CORS (Important!)

After getting the Vercel URL, update Render env var:
```
CORS_ORIGINS=["https://cribinfo.vercel.app"]
```

Or if using custom domain:
```
CORS_ORIGINS=["https://cribinfo.rupayan.dev"]
```

---

## Step 7: Custom Domain (Optional)

### Frontend (Vercel)
1. Vercel Dashboard -> Project Settings -> Domains
2. Add `cribinfo.rupayan.dev`
3. Add CNAME record: `cribinfo` -> `cname.vercel-dns.com`

### Backend (Render)
1. Render Dashboard -> Service Settings -> Custom Domain
2. Add `api.cribinfo.rupayan.dev`
3. Add CNAME record: `api.cribinfo` -> `cribinfo-api.onrender.com`

---

## Verification Checklist

- [ ] Neon database created with pgvector extension
- [ ] Groq API key obtained
- [ ] Jina API key obtained
- [ ] Backend deployed to Render
- [ ] Data loaded (225 properties across 3 cities)
- [ ] Embeddings generated
- [ ] Frontend deployed to Vercel
- [ ] CORS configured correctly
- [ ] Health check passes: `curl https://cribinfo-api.onrender.com/health`
- [ ] Search works end-to-end

---

## Quick Commands Reference

```bash
# Test health
curl https://cribinfo-api.onrender.com/health

# Test search
curl -X POST https://cribinfo-api.onrender.com/api/v1/search \
  -H "Content-Type: application/json" \
  -d '{"query": "2bhk in koramangala", "city": "bangalore"}'

# Check cities
curl https://cribinfo-api.onrender.com/api/v1/cities
```

---

## Cost Summary

| Service | Monthly Cost |
|---------|-------------|
| Vercel | $0 |
| Render | $0 |
| Neon | $0 |
| Groq | $0 |
| Jina | $0 |
| **Total** | **$0** |

---

## Limitations of Free Tier

1. **Render cold starts**: Backend sleeps after 15 min, first request takes ~30s
2. **Neon auto-suspend**: DB sleeps after 5 min, adds ~2s latency on wake
3. **Groq rate limits**: 30 req/min (sufficient for demo)
4. **Jina limits**: 1M tokens/month (re-embedding needs management)

---

## Troubleshooting

### Backend won't start
- Check Render logs for errors
- Verify DATABASE_URL is in asyncpg format with `ssl=require`
- Ensure all env vars are set

### CORS errors
- Update `CORS_ORIGINS` in Render to match your frontend URL
- Include the full URL with https://

### Search returns no results
- Verify data was loaded: check `/api/v1/cities` endpoint
- Verify embeddings were generated
- Check Render logs for Jina/Groq errors

### Cold start timeout
- First request after sleep may timeout
- Retry after 30s - backend needs time to wake up
