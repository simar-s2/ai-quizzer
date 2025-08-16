// store/useQuizStore.ts
import { create } from "zustand";
import type { Answer } from "@/app/types";

type QuizState = {
  answers: Answer[];
  addAnswer: (answer: Answer) => void;
  resetAnswers: () => void;
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
  resetAnswers: () => set({ answers: [] }),
}));
