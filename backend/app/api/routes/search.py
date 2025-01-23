from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db
from app.core.query_parser import parse_query
from app.core.search_engine import hybrid_search

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    city: str = ""  # Empty string means all cities
    limit: int = 10


class PropertyResponse(BaseModel):
    id: str
    city: str
    title: str | None
    area: str | None
    bhk: int | None
    sqft: int | None
    bathrooms: int | None
    price_lakhs: float | None
    amenities: list[str]
    latitude: float | None
    longitude: float | None


class SearchResponse(BaseModel):
    results: list[PropertyResponse]
    parsed_filters: dict
    total: int
    match_type: str  # "exact", "partial", "similar"
    relaxed_filters: list[str]  # Filters that were relaxed to find results


@router.post("/search", response_model=SearchResponse)
async def search_properties(
    request: SearchRequest,
    db: AsyncSession = Depends(get_db),
):
    """Search properties using natural language query."""
    parsed = await parse_query(request.query)
    search_result = await hybrid_search(db, parsed, request.city, request.limit)

    return SearchResponse(
        results=[PropertyResponse(**p.to_dict()) for p in search_result.properties],
        parsed_filters=parsed.model_dump(exclude={"raw_query"}),
        total=len(search_result.properties),
        match_type=search_result.match_type,
        relaxed_filters=search_result.relaxed_filters,
    )
