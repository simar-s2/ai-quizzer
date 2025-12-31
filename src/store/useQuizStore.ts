// store/useQuizStore.ts
import { create } from "zustand";

// Simple type for storing answers in the store
// This matches what you send to the /api/mark-quiz endpoint
type QuizAnswer = {
  question_id: string;
  user_answer: string;
};

type QuizState = {
  answers: QuizAnswer[];
  addAnswer: (answer: QuizAnswer) => void;
  clearAnswers: () => void;
};

export const useQuizStore = create<QuizState>((set) => ({
  answers: [],
  addAnswer: (answer) =>
    set((state) => {
      // Replace if question already answered
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
}));
