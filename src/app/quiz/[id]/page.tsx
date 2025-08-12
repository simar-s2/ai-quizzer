import QuizTakingMenu from "@/components/QuizTakingMenu";
import { notFound } from "next/navigation";
import { fetchQuizWithQuestions } from "@/lib/supabase/fetchQuiz";

export default async function QuizPage({ params }: { params: { id: string } }) {
    const { quiz, questions } = await fetchQuizWithQuestions(params.id);

  if (!quiz || !questions) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <QuizTakingMenu quiz={quiz} questions={questions} />
    </div>
  );
}
