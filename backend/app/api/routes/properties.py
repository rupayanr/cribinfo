from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import get_db
from app.repositories.property_repo import get_property_by_id, get_properties_by_ids

router = APIRouter()


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


class CompareRequest(BaseModel):
    property_ids: list[str]


class CompareResponse(BaseModel):
    properties: list[PropertyResponse]


@router.get("/properties/{property_id}", response_model=PropertyResponse)
async def get_property(
    property_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single property by ID."""
    property_obj = await get_property_by_id(db, property_id)
    if not property_obj:
        raise HTTPException(status_code=404, detail="Property not found")
    return PropertyResponse(**property_obj.to_dict())


@router.post("/compare", response_model=CompareResponse)
async def compare_properties(
    request: CompareRequest,
    db: AsyncSession = Depends(get_db),
):
    """Compare multiple properties side by side."""
    if len(request.property_ids) < 2:
        raise HTTPException(status_code=400, detail="At least 2 properties required for comparison")
    if len(request.property_ids) > 5:
        raise HTTPException(status_code=400, detail="Maximum 5 properties can be compared")

    property_uuids = [UUID(pid) for pid in request.property_ids]
    properties = await get_properties_by_ids(db, property_uuids)

    return CompareResponse(
        properties=[PropertyResponse(**p.to_dict()) for p in properties]
    )
