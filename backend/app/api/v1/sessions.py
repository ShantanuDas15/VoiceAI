from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db
from app.models.session import InterviewSession
from app.schemas import SessionCreate, SessionRead
from app.services import get_session_or_404

router = APIRouter()

@router.post("/", response_model=SessionRead, status_code=201)
async def create_session(body: SessionCreate, db: AsyncSession = Depends(get_db)):
    session = InterviewSession(role=body.role, difficulty=body.difficulty)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/", response_model=list[SessionRead])
async def list_sessions(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(InterviewSession).order_by(InterviewSession.created_at.desc()))
    return result.scalars().all()

@router.get("/{session_id}", response_model=SessionRead)
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    return await get_session_or_404(db, session_id)
