"use client"

import { useCallback, useMemo, useState } from "react"
import { Card, CardHeader, CardFooter, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "./ui/badge"
import clsx from "clsx"
import type { Quiz, Question } from "@/lib/supabase/client"
import { exportQuizQuestions, exportQuizMarkscheme } from "@/lib/quizExport"
import { useAuth } from "@/components/AuthProvider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle } from "lucide-react"

type Mark = "correct" | "incorrect" | "manual" | "unknown"

const TRUE_FALSE_OPTIONS = ["True", "False"] as const

const normalize = (s?: string | null) => s?.trim().toLowerCase() ?? ""

const isAutoMarkable = (q: Question) => q.type === "mcq" || q.type === "truefalse" || q.type === "fill"

type ChoiceProps = {
  text: string
  selected: boolean
  isMarked: boolean
  isCorrectChoice: boolean
  onClick: () => void
}

function Choice({ text, selected, isMarked, isCorrectChoice, onClick }: ChoiceProps) {
  const incorrect = isMarked && selected && !isCorrectChoice

  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      className={clsx(
        "p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 text-left outline-none font-medium",
        {
          "bg-green-50 dark:bg-green-950 border-green-500 text-green-900 dark:text-green-100":
            isMarked && isCorrectChoice,
          "bg-red-50 dark:bg-red-950 border-red-500 text-red-900 dark:text-red-100": incorrect,
          "bg-primary/5 border-primary": !isMarked && selected,
          "border-border hover:border-primary/50 hover:bg-muted/50": !isMarked && !selected,
        },
      )}
    >
      {text}
    </div>
  )
}

function ResultPanel({
  mark,
  correctAnswer,
  explanation,
}: {
  mark: Mark
  correctAnswer?: string | null
  explanation?: string | null
}) {
  const isCorrect = mark === "correct"
  const isIncorrect = mark === "incorrect"
  const isManual = mark === "manual"

  const bgColor = isCorrect
    ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
    : isIncorrect
      ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
      : isManual
        ? "bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800"
        : "bg-muted border-border"

  const title = isCorrect
    ? "Correct!"
    : isIncorrect
      ? "Not quite right"
      : isManual
        ? "Your answer will be reviewed"
        : "Cannot mark automatically"

  return (
    <div className={clsx("mt-6 p-4 rounded-lg border-2", bgColor)}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isCorrect ? (
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          ) : isIncorrect ? (
            <Circle className="h-5 w-5 text-red-600 dark:text-red-400" />
          ) : (
            <Circle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="font-semibold text-base">{title}</div>
          {correctAnswer && (
            <p className="text-sm leading-relaxed">
              <span className="font-medium">Correct answer:</span> {correctAnswer}
            </p>
          )}
          {explanation && <p className="text-sm leading-relaxed text-muted-foreground">{explanation}</p>}
        </div>
      </div>
    </div>
  )
}

export default function QuizTakingMenu({
  questions,
  quiz,
}: {
  questions: Question[]
  quiz: Quiz
}) {
  const router = useRouter()
  const { session, user, loading } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [results, setResults] = useState<Record<number, Mark>>({})
  const [submitting, setSubmitting] = useState(false)
  const [startTime] = useState(Date.now())

  const currentQuestion = questions[currentIndex]
  const isMarked = results[currentIndex] !== undefined
  const normalizedCorrect = normalize(currentQuestion.answer)

  const answeredCount = Object.keys(responses).filter((key) => responses[Number.parseInt(key)]?.trim()).length
  const progressPercent = (answeredCount / questions.length) * 100

  const handleChange = useCallback(
    (val: string) => {
      setResponses((prev) => ({ ...prev, [currentIndex]: val }))
    },
    [currentIndex],
  )

  const handleMark = useCallback(() => {
    const userAnswer = normalize(responses[currentIndex])
    let mark: Mark = "unknown"

    if (isAutoMarkable(currentQuestion)) {
      if (!userAnswer) {
        mark = "unknown"
      } else {
        const correct = userAnswer === normalizedCorrect
        mark = correct ? "correct" : "incorrect"
      }
    } else if (currentQuestion.type === "essay" || currentQuestion.type === "shortanswer") {
      mark = "manual"
    }

    setResults((prev) => ({ ...prev, [currentIndex]: mark }))
  }, [currentIndex, currentQuestion, responses, normalizedCorrect])

  const handleSubmitQuiz = async () => {
    if (!confirm("Submit your quiz? You can review your answers and results after submitting.")) {
      return
    }

    setSubmitting(true)

    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000)

      const answers = questions.map((q, index) => ({
        question_id: q.id,
        user_answer: responses[index] || "",
      }))

      const response = await fetch("/api/mark-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: quiz.id,
          answers,
          time_taken: timeTaken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit quiz")
      }

      toast.success(`Great work! You scored ${data.score.toFixed(0)}%`, {
        description: data.overall_feedback,
        duration: 5000,
      })

      router.push(`/quiz/${quiz.id}/results/${data.attempt_id}`)
    } catch (error) {
      console.error("Submit error:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
      toast.error("Failed to submit quiz", {
        description: errorMessage,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= questions.length) return
      setCurrentIndex(i)
    },
    [questions.length],
  )

  const choiceOptions = useMemo(() => {
    const options = currentQuestion.options as string[] | null
    if (currentQuestion.type === "mcq") return options ?? []
    if (currentQuestion.type === "truefalse") return [...TRUE_FALSE_OPTIONS]
    return null
  }, [currentQuestion])

  const isCorrectAt = (i: number) => results[i] === "correct"
  const isIncorrectAt = (i: number) => results[i] === "incorrect"

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-muted-foreground">Loading quiz...</p>
      </div>
    )
  }

  if (!session || !user) {
    return (
      <Card className="max-w-md mx-auto">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Please log in to take this quiz</p>
        </CardContent>
      </Card>
    )
  }

  const renderChoices = choiceOptions && (
    <div className="space-y-3" role="radiogroup" aria-label="Choices">
      {choiceOptions.map((opt) => {
        const selected = responses[currentIndex] === opt
        const isCorrectChoice = normalize(opt) === normalizedCorrect

        return (
          <Choice
            key={opt}
            text={opt}
            selected={!!selected}
            isMarked={isMarked}
            isCorrectChoice={isCorrectChoice}
            onClick={() => handleChange(opt)}
          />
        )
      })}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Progress</span>
          <span>
            {answeredCount} of {questions.length} answered
          </span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      <Card className="border-2">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {quiz.tags?.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight">{quiz.title}</h3>
            {quiz.description && <p className="text-muted-foreground mt-2 leading-relaxed">{quiz.description}</p>}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-base px-3 py-1">
                Question {currentIndex + 1} of {questions.length}
              </Badge>
              <Badge variant="secondary">{currentQuestion.type}</Badge>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xl font-medium leading-relaxed">{currentQuestion.question_text}</p>

            {(currentQuestion.type === "mcq" || currentQuestion.type === "truefalse") && renderChoices}

            {currentQuestion.type === "fill" && (
              <Input
                placeholder="Type your answer..."
                value={responses[currentIndex] || ""}
                onChange={(e) => handleChange(e.target.value)}
                className="h-12 text-lg"
              />
            )}

            {(currentQuestion.type === "shortanswer" || currentQuestion.type === "essay") && (
              <Textarea
                rows={currentQuestion.type === "essay" ? 8 : 5}
                placeholder="Write your answer here..."
                value={responses[currentIndex] || ""}
                onChange={(e) => handleChange(e.target.value)}
                className="min-h-48 text-base leading-relaxed"
              />
            )}

            {results[currentIndex] && (
              <ResultPanel
                mark={results[currentIndex]!}
                correctAnswer={currentQuestion.answer}
                explanation={currentQuestion.explanation}
              />
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-6 border-t">
          <div className="flex items-center justify-between w-full gap-4">
            <Button variant="outline" onClick={() => goTo(currentIndex - 1)} disabled={currentIndex === 0} size="lg">
              Previous
            </Button>

            <Button variant="outline" onClick={handleMark} size="lg" disabled={!responses[currentIndex]?.trim()}>
              Check Answer
            </Button>

            <Button
              variant="outline"
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex === questions.length - 1}
              size="lg"
            >
              Next
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 py-2">
            {questions.map((_, i) => {
              const isActive = currentIndex === i
              const isCorrect = isCorrectAt(i)
              const isIncorrect = isIncorrectAt(i)
              const hasAnswer = responses[i] !== undefined && responses[i] !== ""

              return (
                <Button
                  key={i}
                  onClick={() => goTo(i)}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={clsx("min-w-10", {
                    "bg-green-500 hover:bg-green-600 border-green-600 text-white": isCorrect && !isActive,
                    "bg-red-500 hover:bg-red-600 border-red-600 text-white": isIncorrect && !isActive,
                    "border-primary": hasAnswer && !isCorrect && !isIncorrect && !isActive,
                  })}
                >
                  {i + 1}
                </Button>
              )
            })}
          </div>

          <div className="w-full space-y-3 pt-2">
            <Button size="lg" className="w-full text-lg h-12" onClick={handleSubmitQuiz} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Quiz"}
            </Button>

            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={() => exportQuizQuestions(questions, quiz)}>
                Export Quiz
              </Button>
              <Button variant="ghost" className="flex-1" onClick={() => exportQuizMarkscheme(questions, quiz)}>
                Export Answers
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
