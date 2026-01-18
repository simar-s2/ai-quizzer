import type { IGenAIService } from "./types";
import { GeminiGenAIService } from "./gemini";
import { MockGenAIService } from "./mock";

export type { IGenAIService } from "./types";
export type {
  GenerateQuizParams,
  GenerateQuizResponse,
  GeneratedQuiz,
  GeneratedQuestion,
  AnswerToMark,
  MarkQuizResponse,
  MarkingResult,
  FileUploadResult,
} from "./types";

let genAIServiceInstance: IGenAIService | null = null;

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCKS === "true";
}

export function getGenAIService(): IGenAIService {
  if (genAIServiceInstance) {
    return genAIServiceInstance;
  }

  if (isMockMode()) {
    genAIServiceInstance = new MockGenAIService();
  } else {
    const apiKey = process.env.GOOGLE_API_KEY || "";
    genAIServiceInstance = new GeminiGenAIService(apiKey);
  }

  return genAIServiceInstance;
}

export function resetGenAIService(): void {
  genAIServiceInstance = null;
}
