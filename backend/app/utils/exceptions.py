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
