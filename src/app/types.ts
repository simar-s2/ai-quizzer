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
  marks: number;
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
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  difficulty?: "easy" | "medium" | "hard" | "expert";
  total_marks?: number;
};

export type Answer = {
  id?: string;
  user_id: string;
  quiz_id: string;
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  created_at?: string;
  score?: number;
};
