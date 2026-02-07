import logging
from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.database import get_db
from app.core.query_parser import parse_query
from app.core.search_engine import hybrid_search
from app.core.exceptions import DatabaseError

router = APIRouter()
logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)


class SearchRequest(BaseModel):
    query: str = Field(..., min_length=1, max_length=500)
    city: str = Field(default="", max_length=50)
    limit: int = Field(default=10, ge=1, le=50)


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


class ErrorResponse(BaseModel):
    error: bool = True
    message: str
    type: str


@router.post("/search", response_model=SearchResponse, responses={
    400: {"model": ErrorResponse, "description": "Invalid input"},
    429: {"model": ErrorResponse, "description": "Rate limit exceeded"},
    503: {"model": ErrorResponse, "description": "Service unavailable"},
    500: {"model": ErrorResponse, "description": "Internal server error"},
})
@limiter.limit("30/minute")
async def search_properties(
    request: Request,
    search_request: SearchRequest,
    db: AsyncSession = Depends(get_db),
):
    """Search properties using natural language query.

    - Parses the query using AI to extract filters (BHK, price, area, amenities)
    - Performs hybrid search combining vector similarity with SQL filters
    - Returns results with match quality information
    """
    logger.info(f"Search request: city='{search_request.city}', limit={search_request.limit}")

    # Parse the query
    parsed = await parse_query(search_request.query)
    logger.debug(f"Parsed query: {parsed.model_dump()}")

    # Perform search
    try:
        search_result = await hybrid_search(db, parsed, search_request.city, search_request.limit)
    except SQLAlchemyError as e:
        logger.error(f"Database error during search: {e}")
        raise DatabaseError("Database error occurred. Please try again later.")

    logger.info(f"Search completed: {len(search_result.properties)} results, match_type={search_result.match_type}")

    return SearchResponse(
        results=[PropertyResponse(**p.to_dict()) for p in search_result.properties],
        parsed_filters=parsed.model_dump(exclude={"raw_query"}),
        total=len(search_result.properties),
        match_type=search_result.match_type,
        relaxed_filters=search_result.relaxed_filters,
    )
