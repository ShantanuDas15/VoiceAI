import whisper
from app.config import settings
from app.utils.logger import logger

_model = None

def get_whisper_model():
    global _model
    if _model is None:
        logger.info(f"Loading Whisper {settings.WHISPER_MODEL_SIZE} on {settings.WHISPER_DEVICE}...")
        _model = whisper.load_model(settings.WHISPER_MODEL_SIZE, device=settings.WHISPER_DEVICE)
        logger.info("Whisper model loaded successfully.")
    return _model

def transcribe(audio_path: str) -> str:
    logger.debug(f"Transcribing audio file: {audio_path}")
    model = get_whisper_model()
    # Using fp16=False if running on CPU to avoid warnings, otherwise keep default
    fp16 = settings.WHISPER_DEVICE != "cpu"
    result = model.transcribe(audio_path, fp16=fp16)
    transcript = result["text"].strip()
    logger.debug(f"Transcription complete: {transcript[:50]}...")
    return transcript
