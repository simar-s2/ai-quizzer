import QuizTakingMenu from "@/features/quiz/components/QuizTakingMenu"
import { fetchQuizWithQuestions } from "@/features/quiz/services/fetchQuiz"

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { quiz, questions } = await fetchQuizWithQuestions(id)

  if (!quiz || !questions) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4 max-w-md p-6">
          <h2 className="text-2xl font-bold">Quiz Not Found</h2>
          <p className="text-muted-foreground">
            This quiz could not be loaded. It may not exist or the database may not be configured.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <QuizTakingMenu quiz={quiz} questions={questions} />
    </div>
  )
}
