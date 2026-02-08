"use server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { QuizInsert, QuestionInsert } from "@/lib/supabase/client";

// Accept partial quiz data from client (may include user_id but will be overridden)
export async function saveQuiz(quiz: Partial<QuizInsert> & { title: string; difficulty: QuizInsert['difficulty'] }, questions: Omit<QuestionInsert, 'quiz_id'>[]): Promise<string> {
  const supabase = await createServerSupabaseClient();
  
  // 🔐 Get current user from the server session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No authenticated user found");
  }

  // Prepare quiz payload with proper types
  const quizInsert: QuizInsert = {
    ...quiz,
    user_id: user.id,
    status: quiz.status ?? "not_started",
    visibility: quiz.visibility ?? "private",
  };

  // Insert quiz
  const { data: insertedQuiz, error: quizError } = await supabase
    .from("quizzes")
    .insert(quizInsert)
    .select()
    .single();

  if (quizError || !insertedQuiz) {
    throw new Error(`Failed to save quiz: ${quizError?.message}`);
  }

  // Prepare questions with proper types
  const questionsInsert: QuestionInsert[] = questions.map((q) => ({
    ...q,
    quiz_id: insertedQuiz.id,
    marks: q.marks ?? 1,
    visibility: q.visibility ?? "private",
  }));

  // Insert questions
  const { error: questionError } = await supabase
    .from("questions")
    .insert(questionsInsert);

  if (questionError) {
    throw new Error(`Failed to save questions: ${questionError.message}`);
  }

  return insertedQuiz.id;
}