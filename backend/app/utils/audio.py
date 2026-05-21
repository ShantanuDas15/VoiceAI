import subprocess
import os
from app.utils.logger import logger

def webm_to_wav(input_path: str, output_path: str) -> str:
    """Convert browser WebM audio to WAV using FFmpeg."""
    logger.debug(f"Converting audio {input_path} to {output_path}")
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-ar", "16000", "-ac", "1", output_path],
            check=True, 
            capture_output=True
        )
        logger.debug("Audio conversion successful.")
        return output_path
    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg conversion failed: {e.stderr.decode()}")
        raise RuntimeError("Audio conversion failed") from e
