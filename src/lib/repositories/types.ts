import type {
  Quiz,
  Question,
  Attempt,
  QuizInsert,
  QuestionInsert,
  AttemptInsert,
  AttemptAnswerInsert,
  QuizStatus,
} from "@/lib/supabase/client";

export interface IQuizRepository {
  getQuizById(quizId: string): Promise<Quiz | null>;
  getQuestionsByQuizId(quizId: string): Promise<Question[]>;
  createQuiz(
    quiz: Omit<QuizInsert, "user_id">,
    questions: Omit<QuestionInsert, "quiz_id">[],
    userId: string
  ): Promise<string>;
  updateQuizStatus(quizId: string, userId: string, status: QuizStatus): Promise<void>;
  saveAttempt(attempt: AttemptInsert): Promise<Attempt>;
  saveAttemptAnswers(answers: AttemptAnswerInsert[]): Promise<void>;
}
