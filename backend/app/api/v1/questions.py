from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db
from app.models.question import Question
from app.schemas import QuestionRead, QuestionGenerateRequest
from app.services import get_session_or_404, create_questions_for_session

router = APIRouter()

@router.post("/{session_id}/questions/generate", response_model=list[QuestionRead])
async def generate_questions_for_session(
    session_id: str,
    body: QuestionGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    session = await get_session_or_404(db, session_id)
    try:
        return await create_questions_for_session(
            db, session_id, session.role, session.difficulty, body.count
        )
    except Exception as e:
        error_msg = str(e).lower()
        if "429" in error_msg or "quota" in error_msg or "resourceexhausted" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="AI API rate limit exceeded. Please wait a moment and try again."
            )
        # Catch other unexpected errors to prevent raw 500s that break CORS
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating questions: {str(e)}"
        )

@router.get("/{session_id}/questions", response_model=list[QuestionRead])
async def list_session_questions(session_id: str, db: AsyncSession = Depends(get_db)):
    # Verify session exists first
    await get_session_or_404(db, session_id)
    
    result = await db.execute(
        select(Question).where(Question.session_id == session_id).order_by(Question.created_at.asc())
    )
    return result.scalars().all()
