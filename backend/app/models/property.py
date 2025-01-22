from uuid import UUID, uuid4
from decimal import Decimal
from sqlalchemy import String, Integer, DECIMAL, ARRAY, Text
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from pgvector.sqlalchemy import Vector


class Base(DeclarativeBase):
    pass


class Property(Base):
    __tablename__ = "properties"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    city: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=True)
    area: Mapped[str] = mapped_column(String(100), nullable=True)
    bhk: Mapped[int] = mapped_column(Integer, nullable=True)
    sqft: Mapped[int] = mapped_column(Integer, nullable=True)
    bathrooms: Mapped[int] = mapped_column(Integer, nullable=True)
    price_lakhs: Mapped[Decimal] = mapped_column(DECIMAL(10, 2), nullable=True)
    amenities: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=True)
    latitude: Mapped[Decimal] = mapped_column(DECIMAL(10, 8), nullable=True)
    longitude: Mapped[Decimal] = mapped_column(DECIMAL(11, 8), nullable=True)
    embedding = mapped_column(Vector(768), nullable=True)  # nomic-embed-text dimensions

    def to_dict(self) -> dict:
        return {
            "id": str(self.id),
            "city": self.city,
            "title": self.title,
            "area": self.area,
            "bhk": self.bhk,
            "sqft": self.sqft,
            "bathrooms": self.bathrooms,
            "price_lakhs": float(self.price_lakhs) if self.price_lakhs else None,
            "amenities": self.amenities or [],
            "latitude": float(self.latitude) if self.latitude else None,
            "longitude": float(self.longitude) if self.longitude else None,
        }
