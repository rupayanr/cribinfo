"""Custom exceptions for the application."""


class CribInfoException(Exception):
    """Base exception for CribInfo."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class DatabaseError(CribInfoException):
    """Database connection or query error."""
    def __init__(self, message: str = "Database error occurred"):
        super().__init__(message, status_code=503)


class EmbeddingError(CribInfoException):
    """Error generating embeddings."""
    def __init__(self, message: str = "Failed to generate embeddings"):
        super().__init__(message, status_code=503)


class LLMError(CribInfoException):
    """Error with LLM query parsing."""
    def __init__(self, message: str = "Failed to parse query"):
        super().__init__(message, status_code=503)


class ValidationError(CribInfoException):
    """Input validation error."""
    def __init__(self, message: str = "Invalid input"):
        super().__init__(message, status_code=400)


class NotFoundError(CribInfoException):
    """Resource not found."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class RateLimitError(CribInfoException):
    """Rate limit exceeded."""
    def __init__(self, message: str = "Too many requests, please slow down"):
        super().__init__(message, status_code=429)
