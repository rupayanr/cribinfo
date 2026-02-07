from fastapi import APIRouter, Depends, Path, Request
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.models.database import get_db
from app.repositories.property_repo import get_available_cities, get_areas_by_city

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class CitiesResponse(BaseModel):
    cities: list[str]


class AreasResponse(BaseModel):
    city: str
    areas: list[str]


@router.get("/cities", response_model=CitiesResponse)
@limiter.limit("60/minute")
async def list_cities(request: Request, db: AsyncSession = Depends(get_db)):
    """List all available cities."""
    cities = await get_available_cities(db)
    return CitiesResponse(cities=cities)


@router.get("/cities/{city}/areas", response_model=AreasResponse)
@limiter.limit("60/minute")
async def list_areas(
    request: Request,
    city: str = Path(..., min_length=1, max_length=50, pattern="^[a-zA-Z]+$"),
    db: AsyncSession = Depends(get_db),
):
    """List all areas in a city."""
    areas = await get_areas_by_city(db, city)
    return AreasResponse(city=city, areas=areas)
