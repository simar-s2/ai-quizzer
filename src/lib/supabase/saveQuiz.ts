"use server";

import { createClient } from './server'; // Supabase client with cookies support
import { Quiz, QuizQuestion } from '@/app/types';

export async function saveQuiz(
  quiz: Quiz,
  questions: QuizQuestion[]
) {
  const supabase = await createClient();

  // 🔐 Get current user from the server session
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("No authenticated user found");
  }

  // Prepare quiz payload
  const { ...sanitizedQuiz } = quiz as any;
  const quiz_upload = { ...sanitizedQuiz, user_id: user.id };

  console.log("📦 quiz_upload payload:", quiz_upload);

  // Insert quiz
  const { data: insertedQuiz, error: quizError } = await supabase
    .from('quizzes')
    .insert([quiz_upload])
    .select()
    .single();

  if (quizError) throw quizError;

  // Insert questions
  const enrichedQuestions = questions.map(q => ({
    ...q,
    quiz_id: insertedQuiz.id,
  }));

  const { error: questionError } = await supabase
    .from('questions')
    .insert(enrichedQuestions);

  if (questionError) {
    throw questionError;
  }

  return insertedQuiz.id;
}
