import { create } from 'zustand';
import type { Session, Question, FeedbackResult } from '../types';
import { api } from '../services/api';

const getInitialTheme = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  const storedTheme = window.localStorage.getItem('interviewai-theme');
  if (storedTheme === 'dark') return true;
  if (storedTheme === 'light') return false;

  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const persistTheme = (isDarkMode: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem('interviewai-theme', isDarkMode ? 'dark' : 'light');
};

interface AppState {
  // Data
  currentSession: Session | null;
  questions: Question[];
  currentQuestionIndex: number;
  feedbackResults: Record<string, FeedbackResult>; // Map of question_id -> FeedbackResult
  
  // UI State
  isLoading: boolean;
  error: string | null;
  isDarkMode: boolean;

  // Actions
  startInterview: (role: string, difficulty: string) => Promise<void>;
  nextQuestion: () => void;
  submitAnswerAndGetFeedback: (questionId: string, audioBlob: Blob) => Promise<void>;
  reset: () => void;
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentSession: null,
  questions: [],
  currentQuestionIndex: 0,
  feedbackResults: {},
  isLoading: false,
  error: null,
  isDarkMode: getInitialTheme(),

  startInterview: async (role: string, difficulty: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await api.createSession(role, difficulty);
      const questions = await api.generateQuestions(session.id);
      set({ 
        currentSession: session, 
        questions: questions,
        currentQuestionIndex: 0,
        feedbackResults: {}
      });
    } catch (error: any) {
      set({ error: error.message || 'Failed to start interview' });
    } finally {
      set({ isLoading: false });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  submitAnswerAndGetFeedback: async (questionId: string, audioBlob: Blob) => {
    set({ isLoading: true, error: null });
    try {
      const feedback = await api.submitAnswer(questionId, audioBlob);
      set((state) => ({
        feedbackResults: {
          ...state.feedbackResults,
          [questionId]: feedback
        }
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to submit answer' });
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => {
    set({
      currentSession: null,
      questions: [],
      currentQuestionIndex: 0,
      feedbackResults: {},
      error: null
    });
  }

  ,toggleTheme: () => {
    set((state) => {
      const nextTheme = !state.isDarkMode;
      persistTheme(nextTheme);
      return { isDarkMode: nextTheme };
    });
  }
}));
