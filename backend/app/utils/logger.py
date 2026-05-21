import sys
from loguru import logger
from app.config import settings

# Remove default logger
logger.remove()

# Add a clean console logger
logger.add(
    sys.stderr,
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="DEBUG" if settings.APP_ENV == "development" else "INFO",
)
