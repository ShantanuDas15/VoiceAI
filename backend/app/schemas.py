from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, List

# Session Schemas
class SessionCreate(BaseModel):
    role: str
    difficulty: str = "medium"

class SessionRead(BaseModel):
    id: str
    role: str
    difficulty: str
    status: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Question Schemas
class QuestionGenerateRequest(BaseModel):
    count: int = 5

class QuestionRead(BaseModel):
    id: str
    session_id: str
    question_text: str
    category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Answer & Feedback Schemas
class FeedbackResult(BaseModel):
    score: float
    transcript: str
    strengths: List[str]
    improvements: List[str]
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

    model_config = ConfigDict(from_attributes=True)

# Common Schemas
class ErrorResponse(BaseModel):
    detail: str
