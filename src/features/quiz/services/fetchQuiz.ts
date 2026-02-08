import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Quiz, Question } from "@/lib/supabase/client";

export async function fetchQuizWithQuestions(quizId: string): Promise<{
  quiz: Quiz | null;
  questions: Question[] | null;
}> {
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { quiz: null, questions: null };
  }

  // Fetch quiz and verify ownership
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .eq("user_id", user.id) // Only fetch quiz if it belongs to the user
    .single();

  if (quizError) {
    console.error("Error fetching quiz:", quizError);
    return { quiz: null, questions: null };
  }

  // If quiz doesn't exist or doesn't belong to user, return null
  if (!quiz) {
    return { quiz: null, questions: null };
  }

  // Fetch questions for this quiz
  const { data: questions, error: questionsError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("created_at", { ascending: true });

  if (questionsError) {
    console.error("Error fetching questions:", questionsError);
    return { quiz, questions: null };
  }

  return { quiz, questions };
}
