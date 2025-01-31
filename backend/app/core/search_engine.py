from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from pgvector.sqlalchemy import Vector

from app.models.property import Property
from app.core.query_parser import ParsedQuery
from app.core.embeddings import generate_embedding


class SearchResult:
    """Container for search results with match quality info."""
    def __init__(self, properties: list[Property], match_type: str, relaxed_filters: list[str]):
        self.properties = properties
        self.match_type = match_type  # "exact", "partial", "similar"
        self.relaxed_filters = relaxed_filters  # List of filters that were relaxed


async def hybrid_search(
    db: AsyncSession,
    parsed_query: ParsedQuery,
    city: str,
    limit: int = 10,
) -> SearchResult:
    """Perform hybrid search combining vector similarity with SQL filters.

    Prioritizes location matches over other filters when relaxing.
    Relaxation order:
    1. All filters (exact match)
    2. Relax BHK, keep area (prioritize location)
    3. Relax area, keep BHK
    4. Relax both BHK and area
    5. Pure vector similarity

    Returns SearchResult with match quality information.
    """

    # Generate embedding for the raw query
    query_embedding = await generate_embedding(parsed_query.raw_query)

    # Use inferred city from area if no city explicitly selected
    effective_city = city or parsed_query.inferred_city or ""

    # 1. Try with all filters first (exact match)
    results = await _search_with_filters(
        db, query_embedding, parsed_query, effective_city, limit,
        use_bhk=True, use_area=True, use_price=True
    )
    if results:
        return SearchResult(results, "exact", [])

    # 2. Relax BHK but KEEP area (prioritize location over bedroom count)
    if parsed_query.area:
        results = await _search_with_filters(
            db, query_embedding, parsed_query, effective_city, limit,
            use_bhk=False, use_area=True, use_price=True
        )
        if results:
            relaxed = ["bhk"] if parsed_query.bhk else []
            return SearchResult(results, "partial", relaxed)

    # 3. Relax area but keep BHK
    if parsed_query.bhk:
        results = await _search_with_filters(
            db, query_embedding, parsed_query, effective_city, limit,
            use_bhk=True, use_area=False, use_price=True
        )
        if results:
            relaxed = ["area"] if parsed_query.area else []
            return SearchResult(results, "partial", relaxed)

    # 4. Relax both BHK and area, keep price
    results = await _search_with_filters(
        db, query_embedding, parsed_query, effective_city, limit,
        use_bhk=False, use_area=False, use_price=True
    )
    if results:
        relaxed = []
        if parsed_query.bhk:
            relaxed.append("bhk")
        if parsed_query.area:
            relaxed.append("area")
        return SearchResult(results, "partial", relaxed)

    # 5. Fall back to pure vector similarity with only city filter
    results = await _search_with_filters(
        db, query_embedding, parsed_query, effective_city, limit,
        use_bhk=False, use_area=False, use_price=False
    )

    relaxed = []
    if parsed_query.bhk:
        relaxed.append("bhk")
    if parsed_query.area:
        relaxed.append("area")
    if parsed_query.max_price or parsed_query.min_price:
        relaxed.append("price")

    return SearchResult(results, "similar", relaxed)


async def _search_with_filters(
    db: AsyncSession,
    query_embedding: list[float],
    parsed_query: ParsedQuery,
    city: str,
    limit: int,
    use_bhk: bool = True,
    use_area: bool = True,
    use_price: bool = True,
) -> list[Property]:
    """Execute search with specified filters."""

    conditions = []

    # Only filter by city if specified
    if city:
        conditions.append(Property.city == city)

    if use_bhk and parsed_query.bhk:
        conditions.append(Property.bhk == parsed_query.bhk)

    if use_price:
        if parsed_query.min_price:
            conditions.append(Property.price_lakhs >= parsed_query.min_price)
        if parsed_query.max_price:
            conditions.append(Property.price_lakhs <= parsed_query.max_price)

    if parsed_query.min_sqft:
        conditions.append(Property.sqft >= parsed_query.min_sqft)

    if parsed_query.max_sqft:
        conditions.append(Property.sqft <= parsed_query.max_sqft)

    if use_area and parsed_query.area:
        # Sanitize area input - remove SQL wildcards and limit length
        safe_area = parsed_query.area.replace("%", "").replace("_", "")[:100]
        conditions.append(Property.area.ilike(f"%{safe_area}%"))

    # Build query with vector similarity ordering
    stmt = select(Property)

    if conditions:
        stmt = stmt.where(and_(*conditions))

    stmt = stmt.order_by(Property.embedding.cosine_distance(query_embedding)).limit(limit)

    result = await db.execute(stmt)
    return list(result.scalars().all())


async def filter_search(
    db: AsyncSession,
    city: str,
    bhk: int | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    area: str | None = None,
    limit: int = 10,
) -> list[Property]:
    """Perform SQL-only filter search without vector similarity."""

    conditions = []

    # Only filter by city if specified
    if city:
        conditions.append(Property.city == city)

    if bhk:
        conditions.append(Property.bhk == bhk)
    if min_price:
        conditions.append(Property.price_lakhs >= min_price)
    if max_price:
        conditions.append(Property.price_lakhs <= max_price)
    if area:
        conditions.append(Property.area.ilike(f"%{area}%"))

    stmt = select(Property)

    if conditions:
        stmt = stmt.where(and_(*conditions))

    stmt = stmt.order_by(Property.price_lakhs).limit(limit)

    result = await db.execute(stmt)
    return list(result.scalars().all())
