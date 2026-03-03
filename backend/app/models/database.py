from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.config import get_settings

settings = get_settings()

# Connection pool settings optimized for Neon serverless
# - pool_size: Number of persistent connections to keep
# - max_overflow: Additional connections allowed beyond pool_size
# - pool_pre_ping: Verify connection is alive before using (handles Neon sleep)
# - pool_recycle: Recycle connections every 5 min to handle Neon sleep cycles
engine = create_async_engine(
    settings.database_url,
    echo=False,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300,
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncSession:
    async with async_session() as session:
        yield session
