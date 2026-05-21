export interface Session {
  id: string;
  role: string;
  difficulty: string;
  status: string;
  created_at: string;
}

export interface Question {
  id: string;
  session_id: string;
  question_text: string;
  category: string;
  created_at: string;
}

export interface FeedbackResult {
  score: number;
  transcript: string;
  strengths: string[];
  improvements: string[];
  feedback: string;
  ideal_answer: string;
}

export interface Answer {
  id: string;
  question_id: string;
  transcript?: string;
  score?: number;
  feedback?: string;
  ideal_answer?: string;
  created_at: string;
}
