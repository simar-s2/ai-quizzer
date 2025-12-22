"use server";
import { createServerSupabaseClient } from "./server";
import { Quiz, Question, QuizInsert, QuestionInsert } from "@/lib/supabase/client";

export async function saveQuiz(quiz: Quiz, questions: Question[]): Promise<string> {
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
    title: quiz.title,
    description: quiz.description,
    subject: quiz.subject,
    tags: quiz.tags,
    difficulty: quiz.difficulty,
    user_id: user.id,
    total_marks: quiz.total_marks,
    total_time: quiz.total_time,
    status: quiz.status ?? "not_started",
    visibility: quiz.visibility ?? "private",
    metadata: quiz.metadata,
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
    quiz_id: insertedQuiz.id,
    question_text: q.question_text,
    type: q.type,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
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