"use server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AnswerInsert } from "@/lib/supabase/client";

export async function finishQuiz(quiz_id: string, answers: AnswerInsert[]) {
  const supabase = await createServerSupabaseClient();

  if (!answers.length) {
    throw new Error("No answers to submit");
  }

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // 1. Bulk insert answers with submitted_at timestamp
  const answersToInsert: AnswerInsert[] = answers.map((answer) => ({
    ...answer,
    submitted_at: new Date().toISOString(),
  }));

  const { error: insertError } = await supabase
    .from("answers")
    .insert(answersToInsert);

  if (insertError) {
    console.error("Error inserting answers:", insertError);
    throw new Error(`Failed to save answers: ${insertError.message}`);
  }

  // 2. Update quiz status to completed
  const { error: updateError } = await supabase
    .from("quizzes")
    .update({
      status: "completed",
    })
    .eq("id", quiz_id)
    .eq("user_id", user.id); // Ensure user owns this quiz

  if (updateError) {
    console.error("Error updating quiz:", updateError);
    throw new Error(`Failed to update quiz: ${updateError.message}`);
  }

  return { success: true };
}