from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.v1 import sessions, questions, answers
from app.db.init_db import init_db
from app.utils.logger import logger
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up FastAPI application...")
    await init_db()
    yield
    logger.info("Shutting down FastAPI application...")

app = FastAPI(
    title="AI Mock Interview Coach API",
    description="Backend API for the AI Mock Interview Coach",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.parsed_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# v1 API Router
v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
v1_router.include_router(questions.router, prefix="/questions", tags=["Questions"]) # Base path inside is /{session_id}/questions... wait, the router inside questions.py expects "/{session_id}/questions", so prefix="" or just mount it differently. 
# Let's fix this in the prefix. The routes in questions.py are `/{session_id}/questions/generate` and `/{session_id}/questions`.
# So the prefix here should just be `/sessions`. Let me check questions.py. I wrote `@router.post("/{session_id}/questions/generate")`.
# So mounting it at `prefix="/sessions"` makes the URL `/api/v1/sessions/{session_id}/questions/generate`.
v1_router.include_router(questions.router, prefix="/sessions", tags=["Questions"])
v1_router.include_router(answers.router, prefix="/answers", tags=["Answers"])

app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(v1_router)
