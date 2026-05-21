from langchain_core.prompts import ChatPromptTemplate

QUESTION_PROMPT = ChatPromptTemplate.from_messages([
    ("system", "You are a senior {role} interviewer. Generate {count} interview questions "
               "at {difficulty} difficulty. Return ONLY a valid JSON array of strings. Do not include markdown formatting like ```json or any preamble."),
    ("human", "Generate the questions now.")
])

ANALYSIS_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a strict but fair senior {role} interviewer and mentor.
Analyze the candidate's spoken answer to the following interview question.
Return ONLY a single valid JSON object with this exact schema (no markdown, no preamble, no extra text):
{{
  "score": <integer 0-100>,
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "feedback": "<2-3 sentences of actionable, specific feedback. Use bullet style.>",
  "ideal_answer": "<A concise model answer. Max 150 words. Technically accurate and well-structured.>"
}}"""),
    ("human", "Question: {question}\n\nCandidate's Answer: {answer}")
])
