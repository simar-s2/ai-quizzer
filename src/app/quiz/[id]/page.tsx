import QuizTakingMenu from "@/components/QuizTakingMenu";
import { redirect } from "next/navigation";
import { fetchQuizWithQuestions } from "@/lib/supabase/fetchQuiz";

export default async function QuizPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const { quiz, questions } = await fetchQuizWithQuestions(id);

  if (!quiz || !questions) {
    // Could be auth issue or not found
    redirect("/");
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <QuizTakingMenu quiz={quiz} questions={questions} />
    </div>
  );
}
