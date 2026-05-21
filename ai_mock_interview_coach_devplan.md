# AI Mock Interview Coach — Phase-Wise Development Plan

> **Role:** Lead Architect
> **Strategy:** Bottom-up · API-first · Test as you go
> **Total Phases:** 6
> **Estimated Duration:** 12–16 days (solo developer)
> **Stack:** FastAPI · React 19 · Whisper · Gemini 2.0 Flash · LangChain · SQLite

---

## Reading This Document

Each phase builds **directly on the previous one**.
Never skip a phase — each delivers a working, runnable slice of the app.

```
Phase 1 → DB + Models          (Day 1–2)
Phase 2 → AI Layer             (Day 3–5)
Phase 3 → Backend API          (Day 6–8)
Phase 4 → Frontend Core        (Day 9–11)
Phase 5 → Integration + Polish (Day 12–14)
Phase 6 → Docker + Deploy      (Day 15–16)
```

**Definition of Done per phase:** Every phase ends with a working demo you can show. No dead code. No broken imports.

---

## Phase 1 — Foundation: Database & Project Boot

> **Goal:** App boots. DB schema exists. Health endpoint responds.
> **Duration:** Day 1–2
> **Risk:** Low

### What You Build

```
backend/
  app/config.py          ← Settings from .env
  app/main.py            ← FastAPI app factory
  app/api/health.py      ← GET /health
  app/db/database.py     ← Async SQLAlchemy engine
  app/db/init_db.py      ← Auto-create tables on startup
  app/models/base.py     ← DeclarativeBase + TimestampMixin
  app/models/session.py  ← InterviewSession table
  app/models/question.py ← Question table
  app/models/answer.py   ← Answer table
  app/utils/logger.py    ← Loguru setup
```

### Steps

**Step 1.1 — Wire config + logger**
- Fill `app/config.py` — all env vars via `pydantic-settings`
- Fill `app/utils/logger.py` — Loguru with `stderr` output
- Verify: `python -c "from app.config import settings; print(settings.APP_ENV)"`

**Step 1.2 — Define ORM models**

Fill `app/models/session.py`:
```python
from sqlalchemy import Column, String, Enum as SAEnum
from app.models.base import Base, TimestampMixin
import enum, uuid

class Difficulty(str, enum.Enum):
    easy = "easy"
    medium = "medium"
    hard = "hard"

class InterviewSession(Base, TimestampMixin):
    __tablename__ = "sessions"
    id         = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    role       = Column(String, nullable=False)
    difficulty = Column(SAEnum(Difficulty), default=Difficulty.medium)
    status     = Column(String, default="idle")
```

Fill `app/models/question.py`:
```python
from sqlalchemy import Column, String, ForeignKey
from app.models.base import Base, TimestampMixin
import uuid

class Question(Base, TimestampMixin):
    __tablename__ = "questions"
    id           = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id   = Column(String, ForeignKey("sessions.id"), nullable=False)
    question_text = Column(String, nullable=False)
    category     = Column(String, default="technical")
```

Fill `app/models/answer.py`:
```python
from sqlalchemy import Column, String, Float, ForeignKey, Text
from app.models.base import Base, TimestampMixin
import uuid

class Answer(Base, TimestampMixin):
    __tablename__ = "answers"
    id           = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id  = Column(String, ForeignKey("questions.id"), nullable=False)
    audio_path   = Column(String)
    transcript   = Column(Text)
    score        = Column(Float)
    feedback     = Column(Text)
    ideal_answer = Column(Text)
```

**Step 1.3 — DB engine + init**
- Fill `app/db/database.py` — async engine + `AsyncSessionLocal`
- Fill `app/db/init_db.py` — `Base.metadata.create_all` on startup
- Verify: `storage/interview_coach.db` file created on server start

**Step 1.4 — App factory + health route**
- Fill `app/main.py` — CORS + routers mounted
- Fill `app/api/health.py` — `GET /health` returns `{"status": "ok"}`
- Verify: `uvicorn app.main:app --reload` → hit `http://localhost:8000/health`

**Step 1.5 — Dependency injection**
- Fill `app/dependencies.py`:
```python
from app.db.database import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession
from typing import AsyncGenerator

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

### Phase 1 Done When

- [x] `uvicorn app.main:app --reload` starts with zero errors
- [x] `GET /health` returns `200 OK`
- [x] `storage/interview_coach.db` file auto-created with 3 tables
- [x] Loguru prints formatted logs to terminal

---

## Phase 2 — AI Layer: Whisper + LangChain Chains

> **Goal:** AI pipeline works in isolation. Test each chain independently before wiring to API.
> **Duration:** Day 3–5
> **Risk:** Medium (external API + model loading)

### What You Build

```
backend/
  app/ai/whisper_client.py
  app/ai/llm_client.py
  app/ai/prompts/question_prompts.py
  app/ai/prompts/evaluation_prompts.py
  app/ai/prompts/feedback_prompts.py
  app/ai/prompts/ideal_answer_prompts.py
  app/ai/chains/question_chain.py
  app/ai/chains/evaluation_chain.py
  app/ai/chains/feedback_chain.py
  app/ai/chains/ideal_answer_chain.py
  app/utils/audio.py
```

### Steps

**Step 2.1 — Whisper client**

Fill `app/ai/whisper_client.py`:
```python
import whisper
from app.config import settings
from app.utils.logger import logger

_model = None

def get_whisper_model():
    global _model
    if _model is None:
        logger.info(f"Loading Whisper {settings.WHISPER_MODEL_SIZE} on {settings.WHISPER_DEVICE}...")
        _model = whisper.load_model(settings.WHISPER_MODEL_SIZE, device=settings.WHISPER_DEVICE)
        logger.info("Whisper model loaded.")
    return _model

def transcribe(audio_path: str) -> str:
    model = get_whisper_model()
    result = model.transcribe(audio_path, fp16=False)
    return result["text"].strip()
```

Verify: create `test_whisper.py` at root, pass a `.wav` file → confirm transcript prints.

**Step 2.2 — Audio converter**

Fill `app/utils/audio.py`:
```python
import subprocess, os
from pathlib import Path

def webm_to_wav(input_path: str, output_path: str) -> str:
    """Convert browser WebM audio to WAV using FFmpeg."""
    subprocess.run(
        ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path],
        check=True, capture_output=True
    )
    return output_path
```

**Step 2.3 — Gemini LLM client**

Fill `app/ai/llm_client.py`:
```python
from langchain_google_genai import ChatGoogleGenerativeAI
from app.config import settings

def get_llm(temperature: float = 0.7) -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GEMINI_API_KEY,
        temperature=temperature,
    )
```

**Step 2.4 — Prompt templates**

Fill `app/ai/prompts/question_prompts.py`:
```python
from langchain_core.prompts import ChatPromptTemplate

QUESTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a senior {role} interviewer. Generate {count} interview questions "
               "at {difficulty} difficulty. Return ONLY a JSON array of strings. No preamble."),
    ("human", "Generate the questions now.")
])
```

Fill `app/ai/prompts/evaluation_prompts.py`:
```python
from langchain_core.prompts import ChatPromptTemplate

EVALUATION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a strict but fair technical interviewer.
Evaluate the following answer for the question asked.
Return ONLY valid JSON with this exact schema:
{{
  "score": <integer 0-100>,
  "strengths": [<string>, ...],
  "improvements": [<string>, ...]
}}"""),
    ("human", "Question: {question}\n\nCandidate Answer: {answer}")
])
```

Fill `app/ai/prompts/feedback_prompts.py`:
```python
from langchain_core.prompts import ChatPromptTemplate

FEEDBACK_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a senior engineering mentor. Give detailed, actionable feedback "
               "on the candidate's answer. Be specific. Use bullet points. Max 200 words."),
    ("human", "Question: {question}\n\nAnswer: {answer}\n\nScore: {score}/100")
])
```

Fill `app/ai/prompts/ideal_answer_prompts.py`:
```python
from langchain_core.prompts import ChatPromptTemplate

IDEAL_ANSWER_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a senior {role}. Write a model answer for this interview question. "
               "Be concise, structured, and technically accurate. Max 150 words."),
    ("human", "Question: {question}")
])
```

**Step 2.5 — LangChain chains**

Fill `app/ai/chains/question_chain.py`:
```python
import json
from app.ai.llm_client import get_llm
from app.ai.prompts.question_prompts import QUESTION_PROMPT

async def generate_questions(role: str, difficulty: str, count: int = 5) -> list[str]:
    llm = get_llm(temperature=0.8)
    chain = QUESTION_PROMPT | llm
    response = await chain.ainvoke({"role": role, "difficulty": difficulty, "count": count})
    return json.loads(response.content)
```

Fill `app/ai/chains/evaluation_chain.py`:
```python
import json
from app.ai.llm_client import get_llm
from app.ai.prompts.evaluation_prompts import EVALUATION_PROMPT

async def evaluate_answer(question: str, answer: str) -> dict:
    llm = get_llm(temperature=0.2)
    chain = EVALUATION_PROMPT | llm
    response = await chain.ainvoke({"question": question, "answer": answer})
    return json.loads(response.content)
```

Fill `app/ai/chains/feedback_chain.py`:
```python
from app.ai.llm_client import get_llm
from app.ai.prompts.feedback_prompts import FEEDBACK_PROMPT

async def generate_feedback(question: str, answer: str, score: int) -> str:
    llm = get_llm(temperature=0.5)
    chain = FEEDBACK_PROMPT | llm
    response = await chain.ainvoke({"question": question, "answer": answer, "score": score})
    return response.content
```

Fill `app/ai/chains/ideal_answer_chain.py`:
```python
from app.ai.llm_client import get_llm
from app.ai.prompts.ideal_answer_prompts import IDEAL_ANSWER_PROMPT

async def generate_ideal_answer(role: str, question: str) -> str:
    llm = get_llm(temperature=0.4)
    chain = IDEAL_ANSWER_PROMPT | llm
    response = await chain.ainvoke({"role": role, "question": question})
    return response.content
```

**Step 2.6 — Smoke test all chains**

Create `backend/test_ai.py` (delete after testing):
```python
import asyncio
from app.ai.chains.question_chain import generate_questions
from app.ai.chains.evaluation_chain import evaluate_answer

async def main():
    qs = await generate_questions("Backend Developer", "medium", 3)
    print("Questions:", qs)
    result = await evaluate_answer(qs[0], "I would use caching and load balancing.")
    print("Evaluation:", result)

asyncio.run(main())
```

### Phase 2 Done When

- [x] Whisper transcribes a test `.wav` file correctly
- [x] All 4 chains return valid output when called directly
- [x] No LangChain deprecation warnings in output
- [x] `evaluation_chain` always returns parseable JSON

---

## Phase 3 — Backend API: Routes + Services

> **Goal:** Full REST API working. Test every endpoint in Swagger UI.
> **Duration:** Day 6–8
> **Risk:** Low–Medium

### What You Build

```
backend/
  app/schemas/session.py
  app/schemas/question.py
  app/schemas/answer.py
  app/schemas/common.py
  app/services/interview_service.py
  app/services/transcription_service.py
  app/services/question_service.py
  app/services/evaluation_service.py
  app/services/storage_service.py
  app/api/v1/sessions.py
  app/api/v1/questions.py
  app/api/v1/answers.py
  app/utils/exceptions.py
  app/utils/file_manager.py
```

### Steps

**Step 3.1 — Pydantic schemas**

Fill `app/schemas/session.py`:
```python
from pydantic import BaseModel
from datetime import datetime

class SessionCreate(BaseModel):
    role: str
    difficulty: str = "medium"

class SessionRead(BaseModel):
    id: str
    role: str
    difficulty: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
```

Fill `app/schemas/question.py`:
```python
from pydantic import BaseModel
from datetime import datetime

class QuestionRead(BaseModel):
    id: str
    session_id: str
    question_text: str
    category: str
    created_at: datetime

    class Config:
        from_attributes = True

class QuestionGenerateRequest(BaseModel):
    count: int = 5
```

Fill `app/schemas/answer.py`:
```python
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FeedbackResult(BaseModel):
    score: float
    transcript: str
    strengths: list[str]
    improvements: list[str]
    feedback: str
    ideal_answer: str

class AnswerRead(BaseModel):
    id: str
    question_id: str
    transcript: Optional[str]
    score: Optional[float]
    feedback: Optional[str]
    ideal_answer: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
```

Fill `app/schemas/common.py`:
```python
from pydantic import BaseModel

class ErrorResponse(BaseModel):
    detail: str

class HealthResponse(BaseModel):
    status: str
    service: str
```

**Step 3.2 — Custom exceptions**

Fill `app/utils/exceptions.py`:
```python
from fastapi import HTTPException

class SessionNotFound(HTTPException):
    def __init__(self, session_id: str):
        super().__init__(status_code=404, detail=f"Session {session_id} not found")

class QuestionNotFound(HTTPException):
    def __init__(self, question_id: str):
        super().__init__(status_code=404, detail=f"Question {question_id} not found")

class AudioProcessingError(HTTPException):
    def __init__(self, msg: str):
        super().__init__(status_code=422, detail=f"Audio error: {msg}")
```

**Step 3.3 — File manager**

Fill `app/utils/file_manager.py`:
```python
import os, uuid
from app.config import settings

def get_audio_upload_path(extension: str = "webm") -> str:
    os.makedirs(settings.AUDIO_UPLOAD_DIR, exist_ok=True)
    filename = f"{uuid.uuid4()}.{extension}"
    return os.path.join(settings.AUDIO_UPLOAD_DIR, filename)

def get_wav_path(webm_path: str) -> str:
    return webm_path.replace(".webm", ".wav")

def cleanup_file(path: str):
    if path and os.path.exists(path):
        os.remove(path)
```

**Step 3.4 — Service layer**

Fill `app/services/storage_service.py`:
```python
import aiofiles
from app.utils.file_manager import get_audio_upload_path

async def save_audio_file(audio_bytes: bytes, extension: str = "webm") -> str:
    path = get_audio_upload_path(extension)
    async with aiofiles.open(path, "wb") as f:
        await f.write(audio_bytes)
    return path
```

Fill `app/services/transcription_service.py`:
```python
from app.ai.whisper_client import transcribe
from app.utils.audio import webm_to_wav
from app.utils.file_manager import get_wav_path, cleanup_file

async def transcribe_audio(webm_path: str) -> str:
    wav_path = get_wav_path(webm_path)
    try:
        webm_to_wav(webm_path, wav_path)
        return transcribe(wav_path)
    finally:
        cleanup_file(wav_path)  # clean temp WAV after transcription
```

Fill `app/services/question_service.py`:
```python
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.chains.question_chain import generate_questions
from app.models.question import Question

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
```

Fill `app/services/evaluation_service.py`:
```python
from app.ai.chains.evaluation_chain import evaluate_answer
from app.ai.chains.feedback_chain import generate_feedback
from app.ai.chains.ideal_answer_chain import generate_ideal_answer
from app.schemas.answer import FeedbackResult

async def evaluate_and_feedback(
    role: str, question_text: str, transcript: str
) -> FeedbackResult:
    evaluation = await evaluate_answer(question_text, transcript)
    score = evaluation.get("score", 0)
    feedback = await generate_feedback(question_text, transcript, score)
    ideal = await generate_ideal_answer(role, question_text)
    return FeedbackResult(
        score=score,
        transcript=transcript,
        strengths=evaluation.get("strengths", []),
        improvements=evaluation.get("improvements", []),
        feedback=feedback,
        ideal_answer=ideal,
    )
```

Fill `app/services/interview_service.py`:
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.session import InterviewSession
from app.models.question import Question
from app.models.answer import Answer
from app.utils.exceptions import SessionNotFound, QuestionNotFound

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
```

**Step 3.5 — API routes**

Fill `app/api/v1/sessions.py`:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db
from app.models.session import InterviewSession
from app.schemas.session import SessionCreate, SessionRead

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
    from app.services.interview_service import get_session_or_404
    return await get_session_or_404(db, session_id)
```

Fill `app/api/v1/questions.py`:
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.dependencies import get_db
from app.models.question import Question
from app.schemas.question import QuestionRead, QuestionGenerateRequest
from app.services.interview_service import get_session_or_404
from app.services.question_service import create_questions_for_session

router = APIRouter()

@router.post("/{session_id}/questions/generate", response_model=list[QuestionRead])
async def generate_questions_for_session(
    session_id: str,
    body: QuestionGenerateRequest,
    db: AsyncSession = Depends(get_db)
):
    session = await get_session_or_404(db, session_id)
    return await create_questions_for_session(
        db, session_id, session.role, session.difficulty, body.count
    )

@router.get("/{session_id}/questions", response_model=list[QuestionRead])
async def list_session_questions(session_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Question).where(Question.session_id == session_id)
    )
    return result.scalars().all()
```

Fill `app/api/v1/answers.py`:
```python
from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas.answer import FeedbackResult
from app.services.interview_service import get_question_or_404, save_answer, get_session_or_404
from app.services.storage_service import save_audio_file
from app.services.transcription_service import transcribe_audio
from app.services.evaluation_service import evaluate_and_feedback

router = APIRouter()

@router.post("/submit", response_model=FeedbackResult)
async def submit_answer(
    question_id: str = Form(...),
    audio: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    question = await get_question_or_404(db, question_id)
    session = await get_session_or_404(db, question.session_id)

    audio_bytes = await audio.read()
    webm_path = await save_audio_file(audio_bytes, extension="webm")

    transcript = await transcribe_audio(webm_path)
    result = await evaluate_and_feedback(session.role, question.question_text, transcript)

    await save_answer(
        db, question_id, webm_path,
        result.transcript, result.score, result.feedback, result.ideal_answer
    )
    return result
```

**Step 3.6 — Manual API test in Swagger UI**

Hit these in order at `http://localhost:8000/api/docs`:
1. `POST /api/v1/sessions` — create session
2. `POST /api/v1/sessions/{id}/questions/generate` — get 5 questions
3. `POST /api/v1/answers/submit` — upload a `.webm` voice recording
4. Confirm `FeedbackResult` JSON returned with score + feedback

### Phase 3 Done When

- [x] All 6 API routes return correct status codes
- [x] Audio upload → transcript → score → feedback full pipeline works
- [x] `GET /sessions` lists created sessions
- [x] All DB writes confirmed in TablePlus

---

## Phase 4 — Frontend Core: Pages + State + Services

> **Goal:** React app navigates. API calls work. Recording UI functional.
> **Duration:** Day 9–11
> **Risk:** Low

### What You Build

```
frontend/src/
  services/interviewService.ts
  services/audioService.ts
  services/historyService.ts
  store/interviewStore.ts       ← already stubbed
  store/feedbackStore.ts
  store/uiStore.ts
  hooks/useAudioRecorder.ts
  hooks/useInterview.ts
  hooks/useFeedback.ts
  hooks/useSessionHistory.ts
  pages/HomePage.tsx
  pages/InterviewPage.tsx
  pages/FeedbackPage.tsx
  pages/DashboardPage.tsx
  App.tsx                       ← add all routes
```

### Steps

**Step 4.1 — API services**

Fill `src/services/interviewService.ts`:
```typescript
import api from "./api";
import { Session, Question } from "../types/interview.types";

export const createSession = (role: string, difficulty: string): Promise<Session> =>
  api.post("/sessions", { role, difficulty }).then(r => r.data);

export const generateQuestions = (sessionId: string, count = 5): Promise<Question[]> =>
  api.post(`/sessions/${sessionId}/questions/generate`, { count }).then(r => r.data);

export const getSessionQuestions = (sessionId: string): Promise<Question[]> =>
  api.get(`/sessions/${sessionId}/questions`).then(r => r.data);
```

Fill `src/services/audioService.ts`:
```typescript
import api from "./api";
import { FeedbackResult } from "../types/feedback.types";

export const submitAnswer = (questionId: string, audioBlob: Blob): Promise<FeedbackResult> => {
  const form = new FormData();
  form.append("question_id", questionId);
  form.append("audio", audioBlob, "answer.webm");
  return api.post("/answers/submit", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 90000,  // Whisper can be slow on first run
  }).then(r => r.data);
};
```

Fill `src/services/historyService.ts`:
```typescript
import api from "./api";
import { Session } from "../types/interview.types";

export const getSessions = (): Promise<Session[]> =>
  api.get("/sessions").then(r => r.data);

export const getSession = (id: string): Promise<Session> =>
  api.get(`/sessions/${id}`).then(r => r.data);
```

**Step 4.2 — Zustand stores**

Fill `src/store/feedbackStore.ts`:
```typescript
import { create } from "zustand";
import { FeedbackResult } from "../types/feedback.types";

interface FeedbackState {
  feedback: FeedbackResult | null;
  setFeedback: (f: FeedbackResult) => void;
  clear: () => void;
}

export const useFeedbackStore = create<FeedbackState>((set) => ({
  feedback: null,
  setFeedback: (feedback) => set({ feedback }),
  clear: () => set({ feedback: null }),
}));
```

Fill `src/store/uiStore.ts`:
```typescript
import { create } from "zustand";

interface UIState {
  isLoading: boolean;
  loadingMessage: string;
  setLoading: (loading: boolean, message?: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  loadingMessage: "",
  setLoading: (isLoading, loadingMessage = "") => set({ isLoading, loadingMessage }),
}));
```

**Step 4.3 — Audio recorder hook**

Fill `src/hooks/useAudioRecorder.ts`:
```typescript
import { useState, useRef, useCallback } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      setAudioBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
      stream.getTracks().forEach(t => t.stop());
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const reset = useCallback(() => {
    setAudioBlob(null);
    setIsRecording(false);
  }, []);

  return { isRecording, audioBlob, startRecording, stopRecording, reset };
}
```

**Step 4.4 — Interview hook**

Fill `src/hooks/useInterview.ts`:
```typescript
import { useInterviewStore } from "../store/interviewStore";
import { useUIStore } from "../store/uiStore";
import { createSession, generateQuestions } from "../services/interviewService";
import { Difficulty } from "../types/enums";

export function useInterview() {
  const { setSession, setQuestions, session, questions, currentQuestionIndex, nextQuestion, reset } =
    useInterviewStore();
  const { setLoading } = useUIStore();

  const startInterview = async (role: string, difficulty: Difficulty) => {
    setLoading(true, "Creating your interview session...");
    try {
      const newSession = await createSession(role, difficulty);
      setSession(newSession);
      setLoading(true, "Generating questions with AI...");
      const qs = await generateQuestions(newSession.id, 5);
      setQuestions(qs);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const isLastQuestion = currentQuestionIndex >= questions.length - 1;

  return { startInterview, session, questions, currentQuestion, isLastQuestion, nextQuestion, reset };
}
```

**Step 4.5 — Page implementations**

Fill `src/pages/HomePage.tsx` — RoleSelector form, calls `startInterview`, navigates to `/interview`.

Fill `src/pages/InterviewPage.tsx` — shows `QuestionCard` + `AudioRecorder`, on submit calls `audioService.submitAnswer`, stores feedback, navigates to `/feedback`.

Fill `src/pages/FeedbackPage.tsx` — reads from `feedbackStore`, renders `FeedbackPanel` with score, transcript, improvements, ideal answer. Button: "Next Question" or "Finish".

Fill `src/pages/DashboardPage.tsx` — calls `historyService.getSessions`, lists past sessions with average scores.

**Step 4.6 — Wire all routes in App.tsx**
```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage         from "./pages/HomePage";
import InterviewPage    from "./pages/InterviewPage";
import FeedbackPage     from "./pages/FeedbackPage";
import DashboardPage    from "./pages/DashboardPage";
import NotFoundPage     from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<HomePage />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/feedback"  element={<FeedbackPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="*"          element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### Phase 4 Done When

- [x] Home page renders role selector form
- [x] Can start interview, see generated questions
- [x] Can record voice answer, submit, receive feedback
- [x] Score + transcript + improvements display on FeedbackPage
- [x] Dashboard shows past sessions

---

## Phase 5 — UI Components, Polish & Error Handling

> **Goal:** Production-quality UI. Handles edge cases. Looks portfolio-ready.
> **Duration:** Day 12–14
> **Risk:** Low

### What You Build

```
frontend/src/
  components/common/      ← Button, Card, Badge, Loader, Modal
  components/layout/      ← Navbar, PageWrapper
  components/recorder/    ← AudioRecorder, Waveform, RecordingTimer
  components/feedback/    ← FeedbackPanel, ScoreGauge, TranscriptBox
  components/interview/   ← QuestionCard, DifficultyBadge, RoleSelector
  styles/animations.css
```

### Steps

**Step 5.1 — Shared components**

Build these in order (each takes ~20–30 min):

| Component | Key Props | Notes |
|---|---|---|
| `Button` | `variant`, `size`, `loading`, `onClick` | 3 variants: primary / ghost / danger |
| `Card` | `children`, `className` | Subtle border, rounded-xl, bg-gray-900 |
| `Badge` | `label`, `color` | For difficulty: green/yellow/red |
| `Loader` | `message` | Centered spinner + message string |
| `ProgressBar` | `value` (0–100) | Animated fill, used for score display |

**Step 5.2 — Waveform visualizer**

Fill `src/hooks/useWaveform.ts`:
```typescript
import { useEffect, useRef } from "react";

export function useWaveform(stream: MediaStream | null, canvasRef: React.RefObject<HTMLCanvasElement>) {
  const animRef = useRef<number>();

  useEffect(() => {
    if (!stream || !canvasRef.current) return;
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const canvas = canvasRef.current;
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);
      const c = canvas.getContext("2d")!;
      c.clearRect(0, 0, canvas.width, canvas.height);
      c.strokeStyle = "#6366f1";
      c.lineWidth = 2;
      c.beginPath();
      data.forEach((v, i) => {
        const x = (i / data.length) * canvas.width;
        const y = (v / 128) * (canvas.height / 2);
        i === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      });
      c.stroke();
    };
    draw();
    return () => {
      cancelAnimationFrame(animRef.current!);
      ctx.close();
    };
  }, [stream, canvasRef]);
}
```

**Step 5.3 — ScoreGauge component**

SVG ring gauge. Score 0–100 → arc fill. Color: red < 60, yellow 60–79, green >= 80.

**Step 5.4 — RecordingTimer component**

Counts up from 0:00. Auto-stops at `MAX_RECORDING_SECONDS` (120s). Uses `formatTime` util.

**Step 5.5 — Error handling**

Add to `src/services/api.ts` response interceptor:
```typescript
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || "Something went wrong.";
    // Import toast from react-toastify and show error
    import("react-toastify").then(({ toast }) => toast.error(msg));
    return Promise.reject(err);
  }
);
```

Add to each page: loading states, empty states, retry buttons.

**Step 5.6 — Navbar + layout**

Fill `src/components/layout/Navbar.tsx` — app name left, Dashboard link right.
Fill `src/components/layout/PageWrapper.tsx` — `max-w-4xl mx-auto px-4 py-8`.
Wrap all pages in `<PageWrapper>`.

**Step 5.7 — Framer Motion transitions**

Add page entry animation to `PageWrapper`:
```tsx
import { motion } from "framer-motion";

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="max-w-4xl mx-auto px-4 py-8"
  >
    {children}
  </motion.div>
);
```

### Phase 5 Done When

- [x] Full user flow works end-to-end without any console errors
- [x] Loading states shown during API calls (Whisper + Gemini can take 3–8s)
- [x] Error toasts appear on API failure
- [x] Waveform animates while recording
- [x] Score gauge renders correctly for all score ranges
- [x] App looks polished enough to screenshot for portfolio

---

## Phase 6 — Docker + Deployment

> **Goal:** App runs in Docker. Deployed live with public URL.
> **Duration:** Day 15–16
> **Risk:** Low–Medium (first deploy always has surprises)

### What You Build

```
root/
  docker-compose.yml       ← already created in Phase 0 (setup.sh)
  docker-compose.dev.yml
  nginx/nginx.conf
  backend/Dockerfile
  frontend/Dockerfile
```

### Steps

**Step 6.1 — Test Docker locally**

```bash
# From project root
docker compose up --build

# Verify:
# http://localhost       <- React app via Nginx
# http://localhost/api/docs  <- FastAPI Swagger
```

Fix any import errors that only appear inside Docker (missing `__init__.py`, path issues).

**Step 6.2 — Run Alembic migration**

```bash
cd backend
source .venv/bin/activate
alembic revision --autogenerate -m "initial schema"
alembic upgrade head
```

Verify `migrations/versions/` has a generated file with `create_table` ops.

**Step 6.3 — Deploy frontend to Vercel**

```bash
npm install -g vercel
cd frontend
vercel --prod
# Set env var in Vercel dashboard:
# VITE_API_BASE_URL = https://your-hf-space.hf.space/api/v1
```

**Step 6.4 — Deploy backend to HuggingFace Spaces**

1. Create new Space at `huggingface.co/spaces`
2. SDK: **Docker**
3. Push backend folder contents to Space repo:
```bash
git remote add hf https://huggingface.co/spaces/YOUR_USER/amic-backend
git subtree push --prefix backend hf main
```
4. In Space Settings → Secrets, add:
   - `GEMINI_API_KEY` = your key
   - `WHISPER_DEVICE` = `cpu` (HF Spaces free tier is CPU-only)
   - `WHISPER_MODEL_SIZE` = `base` (use `base` not `small` on CPU for speed)

**Step 6.5 — Update CORS**

In `backend/.env` (or HF Secrets):
```
ALLOWED_ORIGINS=["https://your-vercel-app.vercel.app"]
```

**Step 6.6 — Smoke test live deployment**

1. Open Vercel URL
2. Create session
3. Record a 30-second answer
4. Confirm feedback received (may take 15–20s on HF free tier CPU)

### Phase 6 Done When

- [x] `docker compose up --build` works with zero errors locally
- [x] Frontend live on Vercel with public URL
- [x] Backend live on HuggingFace Spaces with public URL
- [x] Full flow works on live deployment
- [x] GitHub repo public with proper README

---

## Full Timeline Summary

| Phase | Focus | Day | Deliverable |
|---|---|---|---|
| **1** | DB + Boot | 1–2 | Server boots, `/health` responds, DB tables created |
| **2** | AI Layer | 3–5 | Whisper + all 4 LangChain chains tested in isolation |
| **3** | Backend API | 6–8 | Full REST API tested in Swagger, audio-to-feedback pipeline live |
| **4** | Frontend Core | 9–11 | React app wired to API, full user flow functional |
| **5** | UI Polish | 12–14 | Portfolio-ready UI, animations, error handling, waveform |
| **6** | Deploy | 15–16 | Live on Vercel + HuggingFace Spaces, Docker working |

---

## Golden Rules

1. **Never skip phases.** Phase 3 without Phase 2 = broken imports you cannot debug.
2. **Test AI chains standalone first.** LLM calls fail silently inside FastAPI if prompts are wrong.
3. **Keep `.env` out of git.** One accidental commit = leaked API key = billing surprise.
4. **Commit at end of every phase.** `git commit -m "phase N complete: [what works]"`
5. **Whisper loads slow first time.** On first `/answers/submit` call, server hangs 10–30s loading model. Normal. Add a loading indicator on frontend.

---

*Last updated: May 2026 · AI Mock Interview Coach · Skibidi's GenAI Portfolio*
