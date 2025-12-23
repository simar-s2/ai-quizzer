"use server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function deleteQuiz(quizId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();
  
  // Get current user from the server session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: "No authenticated user found" };
  }

  // First verify the quiz belongs to the user
  const { data: quiz, error: fetchError } = await supabase
    .from("quizzes")
    .select("id, user_id")
    .eq("id", quizId)
    .single();

  if (fetchError) {
    return { success: false, error: "Quiz not found" };
  }

  if (quiz.user_id !== user.id) {
    return { success: false, error: "Unauthorized: You don't own this quiz" };
  }

  // Delete the quiz (questions and answers will cascade delete if foreign keys are set up properly)
  const { error: deleteError } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", quizId)
    .eq("user_id", user.id); // Extra safety check

  if (deleteError) {
    console.error("Error deleting quiz:", deleteError);
    return { success: false, error: `Failed to delete quiz: ${deleteError.message}` };
  }

  return { success: true };
}
