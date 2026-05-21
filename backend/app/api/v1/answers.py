from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas import FeedbackResult
from app.utils.file_manager import save_audio_file
from app.services import (
    get_question_or_404, 
    get_session_or_404, 
    transcribe_audio, 
    evaluate_and_feedback, 
    save_answer
)

router = APIRouter()

@router.post("/submit", response_model=FeedbackResult)
async def submit_answer(
    question_id: str = Form(...),
    audio: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # 1. Validate constraints
    question = await get_question_or_404(db, question_id)
    session = await get_session_or_404(db, question.session_id)

    # 2. Save the uploaded webm audio
    audio_bytes = await audio.read()
    webm_path = await save_audio_file(audio_bytes, extension="webm")

    try:
        # 3. Transcribe audio to text via Whisper
        transcript = await transcribe_audio(webm_path)
        
        # 4. Process transcript through LLMs (Evaluation + Feedback)
        result = await evaluate_and_feedback(session.role, question.question_text, transcript)
    except Exception as e:
        error_msg = str(e).lower()
        if "429" in error_msg or "quota" in error_msg or "resourceexhausted" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="AI API rate limit exceeded. Please wait a moment and try again."
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while processing the answer: {str(e)}"
        )

    # 5. Persist the answer
    await save_answer(
        db, question_id, webm_path,
        result.transcript, result.score, result.feedback, result.ideal_answer
    )
    
    return result
