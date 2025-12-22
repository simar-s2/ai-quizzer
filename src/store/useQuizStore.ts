// store/useQuizStore.ts
import { create } from "zustand";
import { AnswerInsert } from "@/lib/supabase/client";

type QuizState = {
  answers: AnswerInsert[];
  addAnswer: (answer: AnswerInsert) => void;
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
