export type QuizQuestion = {
  id?: string;
  quiz_id?: string;
  type: "mcq" | "fill" | "truefalse" | "shortanswer" | "essay";
  visibility?: "private" | "public" | "unlisted";
  question_text: string;
  options?: string[];
  explanation?: string;
  created_at?: string;
  updated_at?: string;
  answer: string;
};

export type Quiz = {
  id?: string;
  user_id?: string;
  title: string;
  description?: string;
  subject?: string;
  visibility?: "private" | "public" | "unlisted";
  status?: "not_started" | "in_progress" | "completed";
  total_time?: number;
  tags?: string[];
  metadata?: Record<string, any>; // Optional, see below
  created_at?: string;
  updated_at?: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
};