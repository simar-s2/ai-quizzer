import { createServerSupabaseClient } from "@/lib/supabase/server";
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
import type { IQuizRepository } from "./types";

export class SupabaseQuizRepository implements IQuizRepository {
  async getQuizById(quizId: string): Promise<Quiz | null> {
    const supabase = await createServerSupabaseClient();

    const { data: quiz, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();

    if (error || !quiz) {
      return null;
    }

    return quiz;
  }

  async getQuestionsByQuizId(quizId: string): Promise<Question[]> {
    const supabase = await createServerSupabaseClient();

    const { data: questions, error } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("created_at", { ascending: true });

    if (error || !questions) {
      return [];
    }

    return questions;
  }

  async createQuiz(
    quiz: Omit<QuizInsert, "user_id">,
    questions: Omit<QuestionInsert, "quiz_id">[],
    userId: string
  ): Promise<string> {
    const supabase = await createServerSupabaseClient();

    const quizInsert: QuizInsert = {
      ...quiz,
      user_id: userId,
      status: quiz.status ?? "not_started",
      visibility: quiz.visibility ?? "private",
    };

    const { data: insertedQuiz, error: quizError } = await supabase
      .from("quizzes")
      .insert(quizInsert)
      .select()
      .single();

    if (quizError || !insertedQuiz) {
      throw new Error(`Failed to save quiz: ${quizError?.message}`);
    }

    const questionsInsert: QuestionInsert[] = questions.map((q) => ({
      ...q,
      quiz_id: insertedQuiz.id,
      marks: q.marks ?? 1,
      visibility: q.visibility ?? "private",
    }));

    const { error: questionError } = await supabase.from("questions").insert(questionsInsert);

    if (questionError) {
      throw new Error(`Failed to save questions: ${questionError.message}`);
    }

    return insertedQuiz.id;
  }

  async updateQuizStatus(quizId: string, userId: string, status: QuizStatus): Promise<void> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase
      .from("quizzes")
      .update({ status })
      .eq("id", quizId)
      .eq("user_id", userId);

    if (error) {
      throw new Error(`Failed to update quiz status: ${error.message}`);
    }
  }

  async saveAttempt(attempt: AttemptInsert): Promise<Attempt> {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.from("attempts").insert(attempt).select().single();

    if (error || !data) {
      throw new Error(`Failed to save attempt: ${error?.message}`);
    }

    return data;
  }

  async saveAttemptAnswers(answers: AttemptAnswerInsert[]): Promise<void> {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from("attempt_answers").insert(answers);

    if (error) {
      throw new Error(`Failed to save attempt answers: ${error.message}`);
    }
  }
}
