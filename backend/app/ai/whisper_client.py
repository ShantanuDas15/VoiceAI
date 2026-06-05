import os
from groq import Groq
from app.config import settings
from app.utils.logger import logger

def get_groq_client():
    if not settings.GROQ_API_KEY:
        logger.error("GROQ_API_KEY is not set.")
        raise ValueError("GROQ_API_KEY is not set in environment variables")
    return Groq(api_key=settings.GROQ_API_KEY)

def transcribe(audio_path: str) -> str:
    logger.debug(f"Transcribing audio file via Groq API: {audio_path}")
    client = get_groq_client()
    
    with open(audio_path, "rb") as file:
        transcription = client.audio.transcriptions.create(
            file=(os.path.basename(audio_path), file.read()),
            model="whisper-large-v3-turbo",
            response_format="text",
        )
        
    transcript = transcription.strip()
    logger.debug(f"Transcription complete: {transcript[:50]}...")
    return transcript
