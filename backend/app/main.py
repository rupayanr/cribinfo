import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError as PydanticValidationError

from app.config import get_settings
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

app = FastAPI(
    title="CribInfo API",
    description="Housing search powered by RAG",
    version="1.0.0",
)

# Add exception handlers
app.add_exception_handler(CribInfoException, cribinfo_exception_handler)
app.add_exception_handler(PydanticValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api/v1", tags=["search"])
app.include_router(properties.router, prefix="/api/v1", tags=["properties"])
app.include_router(cities.router, prefix="/api/v1", tags=["cities"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.on_event("startup")
async def startup_event():
    """Log startup."""
    logger.info("CribInfo API starting up...")


@app.on_event("shutdown")
async def shutdown_event():
    """Log shutdown."""
    logger.info("CribInfo API shutting down...")
