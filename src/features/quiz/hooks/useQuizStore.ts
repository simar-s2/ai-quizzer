"use client";
import { create } from "zustand";
import type { Quiz, Question } from "@/lib/supabase/client";

type QuizAnswer = {
  question_id: string;
  user_answer: string;
};

type QuizState = {
  // existing answer state
  answers: QuizAnswer[];
  addAnswer: (answer: QuizAnswer) => void;
  clearAnswers: () => void;

  // streaming generation state
  streamedQuestions: Question[];
  streamedQuiz: Quiz | null;
  isStreaming: boolean;
  streamError: string | null;

  appendStreamedQuestion: (q: Question) => void;
  setStreamedQuiz: (quiz: Quiz) => void;
  setIsStreaming: (val: boolean) => void;
  setStreamError: (err: string | null) => void;
  resetStream: () => void;
};

export const useQuizStore = create<QuizState>((set) => ({
  // existing
  answers: [],
  addAnswer: (answer) =>
    set((state) => {
      const existingIndex = state.answers.findIndex(
        (a) => a.question_id === answer.question_id
      );
      if (existingIndex >= 0) {
        const updated = [...state.answers];
        updated[existingIndex] = answer;
        return { answers: updated };
      }
      return { answers: [...state.answers, answer] };
    }),
  clearAnswers: () => set({ answers: [] }),

  // streaming
  streamedQuestions: [],
  streamedQuiz: null,
  isStreaming: false,
  streamError: null,

  appendStreamedQuestion: (q) =>
    set((state) => ({ streamedQuestions: [...state.streamedQuestions, q] })),
  setStreamedQuiz: (quiz) => set({ streamedQuiz: quiz }),
  setIsStreaming: (val) => set({ isStreaming: val }),
  setStreamError: (err) => set({ streamError: err }),
  resetStream: () =>
    set({ streamedQuestions: [], streamedQuiz: null, streamError: null, isStreaming: false }),
}));