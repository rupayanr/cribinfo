from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db
from app.repositories.property_repo import get_available_cities, get_areas_by_city

router = APIRouter()


class CitiesResponse(BaseModel):
    cities: list[str]


class AreasResponse(BaseModel):
    city: str
    areas: list[str]


@router.get("/cities", response_model=CitiesResponse)
async def list_cities(db: AsyncSession = Depends(get_db)):
    """List all available cities."""
    cities = await get_available_cities(db)
    return CitiesResponse(cities=cities)


@router.get("/cities/{city}/areas", response_model=AreasResponse)
async def list_areas(city: str, db: AsyncSession = Depends(get_db)):
    """List all areas in a city."""
    areas = await get_areas_by_city(db, city)
    return AreasResponse(city=city, areas=areas)
