import { notFound, redirect } from "next/navigation"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2, XCircle, Lightbulb, Trophy, Target, MinusCircle } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import clsx from "clsx"

export default async function QuizResultsPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>
}) {
  const { id: quizId, attemptId } = await params
  const supabase = await createServerSupabaseClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  // Fetch attempt
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single()

  if (attemptError || !attempt) {
    return notFound()
  }

  // Fetch quiz
  const { data: quiz, error: quizError } = await supabase.from("quizzes").select("*").eq("id", quizId).single()

  if (quizError || !quiz) {
    return notFound()
  }

  // Fetch attempt answers with question details
  const { data: attemptAnswers, error: answersError } = await supabase
    .from("attempt_answers")
    .select(`
      *,
      questions (
        id,
        question_text,
        type,
        answer,
        explanation,
        marks
      )
    `)
    .eq("attempt_id", attemptId)
    .order("created_at", { ascending: true })

  if (answersError) {
    console.error("Error fetching answers:", answersError)
  }

  const feedback = attempt.feedback as { overall?: string } | null
  const overallFeedback = feedback?.overall || "Great effort! Keep practicing to improve your score."

  const totalQuestions = attemptAnswers?.length || 0
  const correctAnswers = attemptAnswers?.filter((a) => a.correctness_status === 'correct').length || 0
  const partialAnswers = attemptAnswers?.filter((a) => a.correctness_status === 'partial').length || 0
  const incorrectAnswers = attemptAnswers?.filter((a) => a.correctness_status === 'incorrect').length || 0

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 dark:text-green-400"
    if (score >= 75) return "text-blue-600 dark:text-blue-400"
    if (score >= 60) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
    if (score >= 75) return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
    if (score >= 60) return "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
    return "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
  }

  const getEncouragingMessage = (score: number) => {
    if (score >= 90) return "Outstanding performance!"
    if (score >= 75) return "Great job!"
    if (score >= 60) return "Good effort!"
    return "Keep practicing!"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="space-y-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              ← Back to Dashboard
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Quiz Results</h1>
            <p className="text-xl text-muted-foreground mt-2">{quiz.title}</p>
          </div>
        </div>

        <Card className={`${getScoreBg(attempt.score)} border-2`}>
          <CardHeader className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-500" />
                  <CardTitle className="text-2xl">{getEncouragingMessage(attempt.score)}</CardTitle>
                </div>
                <CardDescription className="text-base">
                  {attempt.marks_obtained.toFixed(1)} out of {attempt.total_marks} marks earned
                </CardDescription>
              </div>
              <div className="text-right">
                <div className={`text-5xl font-bold ${getScoreColor(attempt.score)}`}>{attempt.score.toFixed(0)}%</div>
              </div>
            </div>

            <div className="pt-4">
              <Progress value={attempt.score} className="h-3" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <p className="text-lg leading-relaxed whitespace-pre-wrap">{overallFeedback}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-background/50 rounded-lg p-4 text-center border">
                <Target className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <div className="text-3xl font-bold">{totalQuestions}</div>
                <div className="text-sm text-muted-foreground mt-1">Total</div>
              </div>

              <div className="bg-background/50 rounded-lg p-4 text-center border border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{correctAnswers}</div>
                <div className="text-sm text-muted-foreground mt-1">Correct</div>
              </div>

              {partialAnswers > 0 && (
                <div className="bg-background/50 rounded-lg p-4 text-center border border-amber-200 dark:border-amber-800">
                  <MinusCircle className="h-8 w-8 mx-auto mb-2 text-amber-600 dark:text-amber-400" />
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{partialAnswers}</div>
                  <div className="text-sm text-muted-foreground mt-1">Partial</div>
                </div>
              )}

              <div className="bg-background/50 rounded-lg p-4 text-center border border-red-200 dark:border-red-800">
                <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{incorrectAnswers}</div>
                <div className="text-sm text-muted-foreground mt-1">Incorrect</div>
              </div>
            </div>

            {attempt.time_taken && (
              <div className="text-center pt-2 text-muted-foreground">
                <span className="text-sm">
                  Completed in {Math.floor(attempt.time_taken / 60)} minutes {attempt.time_taken % 60} seconds
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Answer Review</h2>
            <p className="text-muted-foreground mt-1">Review each question and learn from explanations</p>
          </div>

          <div className="space-y-4">
            {attemptAnswers?.map((answer, index) => {
              const question = answer.questions as {
                id: string
                question_text: string
                type: string
                answer?: string
                explanation?: string
                marks?: number
              } | null
              if (!question) return null

              const correctnessStatus = answer.correctness_status || (answer.is_correct ? 'correct' : 'incorrect')

              return (
                <Card key={answer.id} className="border-2">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-base">
                            Question {index + 1}
                          </Badge>
                          <Badge variant="secondary">{question.type}</Badge>
                          {correctnessStatus === 'correct' ? (
                            <Badge className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Correct
                            </Badge>
                          ) : correctnessStatus === 'partial' ? (
                            <Badge className="bg-amber-600 hover:bg-amber-700">
                              <MinusCircle className="h-3 w-3 mr-1" />
                              Partially Correct
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="h-3 w-3 mr-1" />
                              Incorrect
                            </Badge>
                          )}
                        </div>
                        <p className="text-lg leading-relaxed font-medium">{question.question_text}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-2xl font-bold">{answer.marks_awarded?.toFixed(1) || 0}</div>
                        <div className="text-xs text-muted-foreground">/ {answer.marks_possible?.toFixed(1) || 0}</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-muted-foreground">Your Answer</div>
                      <div
                        className={clsx(
                          "p-4 rounded-lg border-2 whitespace-pre-wrap",
                          correctnessStatus === 'correct'
                            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                            : correctnessStatus === 'partial'
                            ? "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
                            : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
                        )}
                      >
                        {answer.user_answer || <em className="text-muted-foreground">No answer provided</em>}
                      </div>
                    </div>

                    {correctnessStatus !== 'correct' && question.answer && (
                      <div className="space-y-2">
                        <div className="text-sm font-semibold text-muted-foreground">Correct Answer</div>
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950 border-2 border-green-200 dark:border-green-800 whitespace-pre-wrap">
                          {question.answer}
                        </div>
                      </div>
                    )}

                    {answer.ai_feedback && (
                      <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                          <div className="space-y-1 flex-1">
                            <div className="text-sm font-semibold text-blue-900 dark:text-blue-100">AI Feedback</div>
                            <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed whitespace-pre-wrap break-words">
                              {answer.ai_feedback}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {question.explanation && (
                      <div className="bg-purple-50 dark:bg-purple-950 border-2 border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                          <div className="space-y-1 flex-1">
                            <div className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                              Explanation
                            </div>
                            <div className="text-sm text-purple-800 dark:text-purple-200 leading-relaxed whitespace-pre-wrap break-words">
                              {question.explanation}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pb-8">
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
          <Button size="lg" asChild>
            <Link href={`/quiz/${quizId}`}>Retake Quiz</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
