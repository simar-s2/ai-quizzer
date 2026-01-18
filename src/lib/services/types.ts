import type { DifficultyLevel, QuestionType } from "@/lib/supabase/client";

export interface GenerateQuizParams {
  files?: { uri: string; mimeType: string }[];
  text?: string;
  difficulty?: DifficultyLevel;
  numQuestions?: number;
  type?: {
    selectedTypes: QuestionType[];
    distribution: Record<string, number>;
  };
  topic?: string;
}

export interface GeneratedQuiz {
  title: string;
  description: string;
  subject: string;
  tags: string[];
  difficulty: DifficultyLevel;
}

export interface GeneratedQuestion {
  type: QuestionType;
  question_text: string;
  options?: string[];
  answer: string;
  explanation: string;
  marks?: number;
}

export interface GenerateQuizResponse {
  quiz: GeneratedQuiz;
  questions: GeneratedQuestion[];
}

export interface AnswerToMark {
  question_id: string;
  question_text: string;
  question_type: QuestionType;
  user_answer: string;
  correct_answer: string;
  marks_possible: number;
  explanation?: string;
}

export interface MarkingResult {
  question_id: string;
  is_correct: boolean;
  correctness_status: "correct" | "partial" | "incorrect";
  marks_awarded: number;
  marks_possible: number;
  feedback: string;
}

export interface MarkQuizResponse {
  overall_feedback: string;
  total_marks_possible: number;
  total_marks_awarded: number;
  percentage: number;
  question_results: MarkingResult[];
}

export interface FileUploadResult {
  uri: string;
  mimeType: string;
}

export interface IGenAIService {
  generateQuiz(params: GenerateQuizParams): Promise<GenerateQuizResponse>;
  markAnswers(answers: AnswerToMark[]): Promise<MarkQuizResponse>;
  uploadFile(fileBlob: Blob, displayName: string): Promise<FileUploadResult>;
}
