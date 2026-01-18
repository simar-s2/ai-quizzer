import type { IGenAIService } from "./types";
import { GeminiGenAIService } from "./gemini";

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

export function getGenAIService(): IGenAIService {
  if (genAIServiceInstance) {
    return genAIServiceInstance;
  }

  const apiKey = process.env.GOOGLE_API_KEY || "";
  genAIServiceInstance = new GeminiGenAIService(apiKey);

  return genAIServiceInstance;
}

export function resetGenAIService(): void {
  genAIServiceInstance = null;
}
