from pydantic_settings import BaseSettings
from functools import lru_cache
import json


class Settings(BaseSettings):
    database_url: str

    # Provider selection (ollama for local, groq for production)
    llm_provider: str = "ollama"  # "ollama" or "groq"
    embedding_provider: str = "ollama"  # "ollama" or "none" (SQL-only search)

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
