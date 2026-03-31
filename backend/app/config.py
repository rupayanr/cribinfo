from pydantic_settings import BaseSettings
from pydantic import model_validator
from functools import lru_cache
import json


class Settings(BaseSettings):
    database_url: str

    @property
    def async_database_url(self) -> str:
        """Convert standard PostgreSQL URL to asyncpg format."""
        url = self.database_url
        # Convert postgresql:// to postgresql+asyncpg://
        if url.startswith("postgresql://") and "+asyncpg" not in url:
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        # Convert sslmode=require to ssl=require for asyncpg
        url = url.replace("sslmode=require", "ssl=require")
        return url

    # Provider selection (ollama for local, groq for production)
    llm_provider: str = "ollama"  # "ollama" or "groq"
    embedding_provider: str = "ollama"  # "ollama", "jina", or "none" (SQL-only search)

    # Ollama settings (local development)
    ollama_host: str = "http://localhost:11434"
    ollama_embed_model: str = "nomic-embed-text"
    ollama_llm_model: str = "llama3.2"

    # Groq settings (production LLM)
    groq_api_key: str = ""
    groq_model: str = "llama-3.1-8b-instant"

    # Jina AI settings (production embeddings)
    jina_api_key: str = ""

    # CORS and defaults
    cors_origins: str = '["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]'
    cors_origins_production: str = '["https://cribinfo.rupayan.dev"]'
    default_city: str = "bangalore"

    # Environment
    environment: str = "development"  # "development" or "production"

    @model_validator(mode='after')
    def validate_production_config(self):
        """Validate that required API keys are set in production mode."""
        if self.is_production:
            if self.llm_provider == "groq" and not self.groq_api_key:
                raise ValueError("GROQ_API_KEY is required when using Groq provider in production")
            if self.embedding_provider == "jina" and not self.jina_api_key:
                raise ValueError("JINA_API_KEY is required when using Jina provider in production")
        return self

    @property
    def cors_origins_list(self) -> list[str]:
        """Return appropriate CORS origins based on environment."""
        if self.is_production:
            return json.loads(self.cors_origins_production)
        return json.loads(self.cors_origins)

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def allow_credentials(self) -> bool:
        """Only allow credentials in development for security."""
        return not self.is_production

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
