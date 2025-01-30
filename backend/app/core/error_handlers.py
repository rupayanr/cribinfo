"""Global error handlers for the application."""
import logging
from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError as PydanticValidationError

from app.core.exceptions import CribInfoException

logger = logging.getLogger(__name__)


async def cribinfo_exception_handler(request: Request, exc: CribInfoException):
    """Handle custom CribInfo exceptions."""
    logger.error(f"CribInfo error: {exc.message}", exc_info=True)
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": True,
            "message": exc.message,
            "type": exc.__class__.__name__,
        },
    )


async def validation_exception_handler(request: Request, exc: PydanticValidationError):
    """Handle Pydantic validation errors."""
    errors = []
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"])
        errors.append(f"{field}: {error['msg']}")

    message = "; ".join(errors)
    logger.warning(f"Validation error: {message}")

    return JSONResponse(
        status_code=400,
        content={
            "error": True,
            "message": f"Invalid input: {message}",
            "type": "ValidationError",
        },
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    logger.exception(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "An unexpected error occurred. Please try again later.",
            "type": "InternalServerError",
        },
    )
