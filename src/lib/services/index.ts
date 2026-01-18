import type { IGenAIService } from "./types";
import { GeminiGenAIService } from "./gemini";
import { MockGenAIService } from "./mock";
import { isMockMode as checkMockMode } from "@/lib/config";

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

export { isMockMode } from "@/lib/config";

let genAIServiceInstance: IGenAIService | null = null;

export function getGenAIService(): IGenAIService {
  if (genAIServiceInstance) {
    return genAIServiceInstance;
  }

  if (checkMockMode()) {
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
