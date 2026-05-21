import os
import uuid
import aiofiles
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

async def save_audio_file(audio_bytes: bytes, extension: str = "webm") -> str:
    path = get_audio_upload_path(extension)
    async with aiofiles.open(path, "wb") as f:
        await f.write(audio_bytes)
    return path
