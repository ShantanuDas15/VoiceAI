from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class HealthResponse(BaseModel):
    status: str
    service: str = "ai-mock-interview-coach-backend"

@router.get("/health", response_model=HealthResponse, status_code=200)
async def health_check():
    return HealthResponse(status="ok")
