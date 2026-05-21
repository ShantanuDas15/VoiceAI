import json
from groq import AsyncGroq
from app.config import settings
from app.utils.logger import logger

# Initialize the Groq async client once at module level.
# This reads the key directly from our .env via pydantic-settings,
# completely bypassing any ambient shell variables.
client = AsyncGroq(api_key=settings.GROQ_API_KEY)

# --- Prompts (inlined here to keep it simple) ---

QUESTION_SYSTEM_PROMPT = """You are an expert technical interviewer.
Generate interview questions and return ONLY a JSON array of strings.
No markdown, no code fences, no explanation — just the raw JSON array.
Example: ["Question 1?", "Question 2?"]"""

ANALYSIS_SYSTEM_PROMPT = """You are an expert technical interviewer evaluating a candidate's answer.
Return ONLY a JSON object with these exact keys:
- "score": a number from 0 to 100
- "strengths": an array of strings listing what the candidate did well
- "improvements": an array of strings listing areas for improvement
- "feedback": a string with overall actionable advice
- "ideal_answer": a string with a model answer to the question

No markdown, no code fences — just the raw JSON object."""

# --- Core AI Functions ---

async def generate_questions(role: str, difficulty: str, count: int = 5) -> list[str]:
    """Generates interview questions via Groq (Llama 3.3 70B)."""
    logger.debug(f"Generating {count} {difficulty} questions for {role} via Groq")

    user_prompt = f"Generate {count} {difficulty}-level interview questions for a {role} position."

    chat_completion = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": QUESTION_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    content = chat_completion.choices[0].message.content.strip()

    try:
        parsed = json.loads(content)
        # Groq's json_object mode may wrap the array in a key like "questions"
        if isinstance(parsed, list):
            return parsed
        if isinstance(parsed, dict):
            # Find the first list value in the dict
            for v in parsed.values():
                if isinstance(v, list):
                    return [str(q) for q in v]
        raise ValueError(f"Unexpected JSON structure: {content}")
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse questions JSON from Groq: {content}")
        raise ValueError("Invalid JSON received from Groq") from e


async def analyze_answer(role: str, question: str, answer: str) -> dict:
    """
    Single-call evaluation: scores the answer, lists strengths/improvements,
    gives feedback, and produces an ideal answer.
    """
    logger.debug(f"Analyzing answer for: {question[:40]}... via Groq")

    user_prompt = f"""Role: {role}
Question: {question}
Candidate's Answer: {answer}

Evaluate the candidate's answer thoroughly."""

    chat_completion = await client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        response_format={"type": "json_object"},
    )

    content = chat_completion.choices[0].message.content.strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse analysis JSON from Groq: {content}")
        return {
            "score": 0,
            "strengths": ["Could not parse AI response."],
            "improvements": ["Please try re-submitting your answer."],
            "feedback": "The AI response could not be parsed. Please try again.",
            "ideal_answer": "Could not generate a model answer at this time.",
        }
