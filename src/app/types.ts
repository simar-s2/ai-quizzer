type QuizQuestion = {
  id: string;
  type: "mcq" | "fill" | "truefalse" | "shortanswer" | "essay";
  question: string;
  options?: string[];
  answer: string;
  topic: string;
  explanation?: string;
  tags?: string[];
  imageUrl?: string;
  timeLimitSeconds?: number;
};

export type { QuizQuestion };

type QuizMetadata = {
  id?: string; // Unique quiz ID
  name: string; // User-defined or AI-suggested
  description?: string; // Optional summary or learning objective
  createdAt: string; // ISO timestamp
  updatedAt?: string; // For edits
  authorId?: string; // Link to user
  subject?: string; // e.g., "Math", "History"
  difficulty?: "easy" | "medium" | "hard" | "expert";
  questionCount: number;
  tags?: string[]; // e.g., ["revision", "SAT prep"]
  visibility?: "private" | "public" | "unlisted"; // For sharing
};

export type { QuizMetadata };