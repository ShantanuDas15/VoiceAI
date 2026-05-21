from app.db.database import engine
from app.models.base import Base
# Import all models here so they are registered with Base metadata before creation
from app.models.session import InterviewSession
from app.models.question import Question
from app.models.answer import Answer
from app.utils.logger import logger

async def init_db():
    logger.info("Initializing database schema...")
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schema initialized successfully.")
