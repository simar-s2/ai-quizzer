import type { IQuizRepository } from "./types";
import { SupabaseQuizRepository } from "./supabase";
import { MockQuizRepository } from "./mock";
import { isMockMode } from "@/lib/config";

export type { IQuizRepository } from "./types";
export { clearMockDataStore, getMockDataStore } from "./mock";

let quizRepositoryInstance: IQuizRepository | null = null;

export function getQuizRepository(): IQuizRepository {
  if (quizRepositoryInstance) {
    return quizRepositoryInstance;
  }

  if (isMockMode()) {
    quizRepositoryInstance = new MockQuizRepository();
  } else {
    quizRepositoryInstance = new SupabaseQuizRepository();
  }

  return quizRepositoryInstance;
}

export function resetQuizRepository(): void {
  quizRepositoryInstance = null;
}
