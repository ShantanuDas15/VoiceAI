FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (ffmpeg for whisper)
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast dependency management
RUN pip install uv

# Copy project files
COPY pyproject.toml .
# We don't have a uv.lock yet, so we will generate it inside or just let uv run resolve it.
# It's better to just use uv pip install or uv sync
RUN uv pip install --system fastapi uvicorn "sqlalchemy[asyncio]" aiosqlite pydantic-settings loguru openai-whisper langchain-google-genai aiofiles python-multipart

# Copy the rest of the backend code
COPY . .

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
