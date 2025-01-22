from pydantic_settings import BaseSettings
from functools import lru_cache
import json


class Settings(BaseSettings):
    database_url: str
    ollama_host: str = "http://localhost:11434"
    ollama_embed_model: str = "nomic-embed-text"
    ollama_llm_model: str = "llama3.2"
    cors_origins: str = '["http://localhost:5173", "http://localhost:5174", "http://localhost:5175"]'
    default_city: str = "bangalore"

    @property
    def cors_origins_list(self) -> list[str]:
        return json.loads(self.cors_origins)

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache
def get_settings() -> Settings:
    return Settings()
