from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.property import Property


async def get_property_by_id(db: AsyncSession, property_id: UUID) -> Property | None:
    result = await db.execute(select(Property).where(Property.id == property_id))
    return result.scalar_one_or_none()


async def get_properties_by_ids(db: AsyncSession, property_ids: list[UUID]) -> list[Property]:
    result = await db.execute(select(Property).where(Property.id.in_(property_ids)))
    return list(result.scalars().all())


async def get_available_cities(db: AsyncSession) -> list[str]:
    result = await db.execute(select(func.distinct(Property.city)).order_by(Property.city))
    return [row[0] for row in result.all()]


async def get_areas_by_city(db: AsyncSession, city: str) -> list[str]:
    result = await db.execute(
        select(func.distinct(Property.area))
        .where(Property.city == city)
        .where(Property.area.isnot(None))
        .order_by(Property.area)
    )
    return [row[0] for row in result.all()]


async def create_property(db: AsyncSession, property_data: dict) -> Property:
    property_obj = Property(**property_data)
    db.add(property_obj)
    await db.commit()
    await db.refresh(property_obj)
    return property_obj


async def update_property_embedding(db: AsyncSession, property_id: UUID, embedding: list[float]) -> None:
    result = await db.execute(select(Property).where(Property.id == property_id))
    property_obj = result.scalar_one_or_none()
    if property_obj:
        property_obj.embedding = embedding
        await db.commit()
