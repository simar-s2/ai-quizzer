import { createClient } from "./client";

const supabase = await createClient();
export async function fetchQuizWithQuestions(quizId: string) {
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizError) throw quizError;

  const { data: questions, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId);

  if (questionError) throw questionError;

  return { quiz, questions };
}
