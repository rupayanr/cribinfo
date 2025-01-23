from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.api.routes import search, properties, cities

settings = get_settings()

app = FastAPI(
    title="CribInfo API",
    description="Housing search powered by RAG",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api/v1", tags=["search"])
app.include_router(properties.router, prefix="/api/v1", tags=["properties"])
app.include_router(cities.router, prefix="/api/v1", tags=["cities"])


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
