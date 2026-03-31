import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError as PydanticValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy import text

from app.config import get_settings
from app.models.database import async_session
from app.api.routes import search, properties, cities
from app.core.exceptions import CribInfoException
from app.core.error_handlers import (
    cribinfo_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response


tags_metadata = [
    {
        "name": "search",
        "description": "Natural language property search with AI-powered query parsing",
    },
    {
        "name": "properties",
        "description": "Property details and comparison endpoints",
    },
    {
        "name": "cities",
        "description": "Available cities and their areas",
    },
]

app = FastAPI(
    title="CribInfo API",
    description="Housing search powered by RAG. Use natural language queries to find properties.",
    version="1.0.0",
    openapi_tags=tags_metadata,
)

# Set up rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add exception handlers
app.add_exception_handler(CribInfoException, cribinfo_exception_handler)
app.add_exception_handler(PydanticValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# Security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=settings.allow_credentials,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept"],
)

app.include_router(search.router, prefix="/api/v1", tags=["search"])
app.include_router(properties.router, prefix="/api/v1", tags=["properties"])
app.include_router(cities.router, prefix="/api/v1", tags=["cities"])


@app.get("/health")
async def health_check():
    """Health check endpoint with dependency verification."""
    checks = {"status": "healthy"}

    # Verify database connection
    try:
        async with async_session() as db:
            await db.execute(text("SELECT 1"))
        checks["database"] = "ok"
    except Exception as e:
        logger.error(f"Health check database error: {e}")
        checks["database"] = "failed"
        checks["status"] = "unhealthy"

    return checks


@app.on_event("startup")
async def startup_event():
    """Verify critical services on startup."""
    logger.info("CribInfo API starting up...")

    # Verify database connection
    try:
        # Log the URL format (mask password)
        db_url = settings.async_database_url
        masked_url = db_url.split('@')[0].rsplit(':', 1)[0] + ':***@' + db_url.split('@')[1] if '@' in db_url else db_url
        logger.info(f"Connecting to database: {masked_url}")

        async with async_session() as db:
            await db.execute(text("SELECT 1"))
        logger.info("Database connection verified")
    except Exception as e:
        logger.error(f"Database connection failed: {type(e).__name__}: {e}")
        raise RuntimeError(f"Cannot start without database connection: {e}")

    logger.info(f"Environment: {settings.environment}")
    logger.info(f"LLM Provider: {settings.llm_provider}")
    logger.info(f"Embedding Provider: {settings.embedding_provider}")


@app.on_event("shutdown")
async def shutdown_event():
    """Log shutdown."""
    logger.info("CribInfo API shutting down...")
