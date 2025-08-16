import { createClient } from "@/lib/supabase/client";
import { useQuizStore } from "@/store/useQuizStore";

export async function finishQuiz(quiz_id: string) {
  const supabase = createClient();
  const { answers, resetAnswers } = useQuizStore.getState();

  if (!answers.length) return;

  // 1. Bulk insert answers
  const { error: insertError } = await supabase
    .from("answers")
    .insert(answers);

  if (insertError) {
    console.error("Error inserting answers:", insertError);
    return;
  }

  // 2. Update quiz row with score + completion time
  const { error: updateError } = await supabase
    .from("quizzes")
    .update({
      completed_at: new Date().toISOString(),
    })
    .eq("id", quiz_id);

  if (updateError) {
    console.error("Error updating quiz:", updateError);
    return;
  }

  // 3. Reset local store after successful save
  resetAnswers();
}
