import uuid
from typing import Optional
from sqlalchemy import String, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin

class Answer(Base, TimestampMixin):
    __tablename__ = "answers"
    
    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    question_id: Mapped[str] = mapped_column(String, ForeignKey("questions.id"), nullable=False)
    audio_path: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    transcript: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    feedback: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    ideal_answer: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
