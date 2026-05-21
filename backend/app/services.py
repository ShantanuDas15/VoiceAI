from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.session import InterviewSession
from app.models.question import Question
from app.models.answer import Answer
from app.schemas import FeedbackResult
from app.utils.exceptions import SessionNotFound, QuestionNotFound

# AI and Audio imports
from app.ai.chains import generate_questions, analyze_answer
from app.ai.whisper_client import transcribe
from app.utils.audio import webm_to_wav
from app.utils.file_manager import get_wav_path, cleanup_file

# --- Database Fetchers ---

async def get_session_or_404(db: AsyncSession, session_id: str) -> InterviewSession:
    result = await db.execute(select(InterviewSession).where(InterviewSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise SessionNotFound(session_id)
    return session

async def get_question_or_404(db: AsyncSession, question_id: str) -> Question:
    result = await db.execute(select(Question).where(Question.id == question_id))
    question = result.scalar_one_or_none()
    if not question:
        raise QuestionNotFound(question_id)
    return question

# --- Core Business Logic ---

async def create_questions_for_session(
    db: AsyncSession, session_id: str, role: str, difficulty: str, count: int
) -> list[Question]:
    texts = await generate_questions(role, difficulty, count)
    questions = [Question(session_id=session_id, question_text=t) for t in texts]
    db.add_all(questions)
    await db.commit()
    for q in questions:
        await db.refresh(q)
    return questions

async def transcribe_audio(webm_path: str) -> str:
    wav_path = get_wav_path(webm_path)
    try:
        webm_to_wav(webm_path, wav_path)
        return transcribe(wav_path)
    finally:
        cleanup_file(wav_path)  # Always clean up the uncompressed WAV file

async def evaluate_and_feedback(
    role: str, question_text: str, transcript: str
) -> FeedbackResult:
    # Single API call replaces 3 separate calls, drastically reducing rate limit pressure.
    result = await analyze_answer(role, question_text, transcript)
    
    return FeedbackResult(
        score=result.get("score", 0),
        transcript=transcript,
        strengths=result.get("strengths", []),
        improvements=result.get("improvements", []),
        feedback=result.get("feedback", ""),
        ideal_answer=result.get("ideal_answer", ""),
    )

async def save_answer(
    db: AsyncSession, question_id: str, audio_path: str,
    transcript: str, score: float, feedback: str, ideal_answer: str
) -> Answer:
    answer = Answer(
        question_id=question_id,
        audio_path=audio_path,
        transcript=transcript,
        score=score,
        feedback=feedback,
        ideal_answer=ideal_answer,
    )
    db.add(answer)
    await db.commit()
    await db.refresh(answer)
    return answer
