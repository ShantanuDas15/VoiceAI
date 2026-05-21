from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

# Resolve backend/.env relative to this file so the backend always reads its own env file
BASE_DIR = Path(__file__).resolve().parents[1]  # backend/
ENV_FILE = BASE_DIR / ".env"

class Settings(BaseSettings):
    APP_ENV: str = Field(default="development")
    DATABASE_URL: str = Field(default="sqlite+aiosqlite:///./storage/interview_coach.db")
    GROQ_API_KEY: str = Field(default="")
    GROQ_MODEL: str = Field(default="llama-3.3-70b-versatile")
    WHISPER_MODEL_SIZE: str = Field(default="small")
    WHISPER_DEVICE: str = Field(default="cuda")
    AUDIO_UPLOAD_DIR: str = Field(default="./storage/audio")
    ALLOWED_ORIGINS: str = Field(default="http://localhost:5173,http://localhost")

    @property
    def parsed_allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(
        env_file=str(ENV_FILE),
        env_file_encoding="utf-8",
        extra="ignore",
    )

settings = Settings()
