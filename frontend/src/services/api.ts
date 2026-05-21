import axios from 'axios';
import type { Session, Question, FeedbackResult } from '../types';

// Centralized Axios instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || "An unexpected error occurred.";
    import("react-toastify").then(({ toast }) => {
      toast.error(msg);
    });
    return Promise.reject(err);
  }
);

export const api = {
  // Sessions
  createSession: async (role: string, difficulty: string): Promise<Session> => {
    const response = await apiClient.post('/sessions/', { role, difficulty });
    return response.data;
  },
  
  getSessions: async (): Promise<Session[]> => {
    const response = await apiClient.get('/sessions/');
    return response.data;
  },

  getSession: async (id: string): Promise<Session> => {
    const response = await apiClient.get(`/sessions/${id}`);
    return response.data;
  },

  // Questions
  generateQuestions: async (sessionId: string, count: number = 5): Promise<Question[]> => {
    const response = await apiClient.post(`/sessions/${sessionId}/questions/generate`, { count });
    return response.data;
  },

  getSessionQuestions: async (sessionId: string): Promise<Question[]> => {
    const response = await apiClient.get(`/sessions/${sessionId}/questions`);
    return response.data;
  },

  // Answers
  submitAnswer: async (questionId: string, audioBlob: Blob): Promise<FeedbackResult> => {
    const formData = new FormData();
    formData.append('question_id', questionId);
    // Whisper optimal format is often wav or webm, we capture webm in browser
    formData.append('audio', audioBlob, 'recording.webm');

    const response = await apiClient.post('/answers/submit', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      // Whisper transcribing & Gemini calling can take a moment
      timeout: 60000, 
    });
    return response.data;
  }
};
