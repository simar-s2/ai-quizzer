import type { IQuizRepository } from "./types";
import { SupabaseQuizRepository } from "./supabase";

export type { IQuizRepository } from "./types";

let quizRepositoryInstance: IQuizRepository | null = null;

export function getQuizRepository(): IQuizRepository {
  if (quizRepositoryInstance) {
    return quizRepositoryInstance;
  }

  quizRepositoryInstance = new SupabaseQuizRepository();

  return quizRepositoryInstance;
}

export function resetQuizRepository(): void {
  quizRepositoryInstance = null;
}
