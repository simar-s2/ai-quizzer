import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default async function QuizResultsPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const { id: quizId, attemptId } = await params;
  const supabase = await createServerSupabaseClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  // Fetch attempt
  const { data: attempt, error: attemptError } = await supabase
    .from("attempts")
    .select("*")
    .eq("id", attemptId)
    .eq("user_id", user.id)
    .single();

  if (attemptError || !attempt) {
    return notFound();
  }

  // Fetch quiz
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizError || !quiz) {
    return notFound();
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
    .order("created_at", { ascending: true });

  if (answersError) {
    console.error("Error fetching answers:", answersError);
  }

  const feedback = attempt.feedback as { overall?: string } | null;
  const overallFeedback = feedback?.overall || "Quiz completed!";

  // Calculate statistics
  const totalQuestions = attemptAnswers?.length || 0;
  const correctAnswers = attemptAnswers?.filter((a) => a.is_correct).length || 0;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-green-50 border-green-200";
    if (score >= 75) return "bg-blue-50 border-blue-200";
    if (score >= 60) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            ← Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Quiz Results</h1>
        <p className="text-muted-foreground">{quiz.title}</p>
      </div>

      {/* Score Card */}
      <Card className={`${getScoreBg(attempt.score)} border-2`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Your Score</span>
            <span className={`text-4xl font-bold ${getScoreColor(attempt.score)}`}>
              {attempt.score.toFixed(1)}%
            </span>
          </CardTitle>
          <CardDescription>
            {attempt.marks_obtained.toFixed(1)} out of {attempt.total_marks} marks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{overallFeedback}</p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{totalQuestions}</div>
              <div className="text-sm text-muted-foreground">Total Questions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{incorrectAnswers}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
          </div>
          {attempt.time_taken && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              Time taken: {Math.floor(attempt.time_taken / 60)} minutes{" "}
              {attempt.time_taken % 60} seconds
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question Results */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Detailed Results</h2>
        {attemptAnswers?.map((answer, index) => {
          const question = answer.questions as any;
          if (!question) return null;

          return (
            <Card key={answer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>Question {index + 1}</span>
                      <Badge variant="secondary">{question.type}</Badge>
                      {answer.is_correct ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {question.question_text}
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {answer.marks_awarded?.toFixed(1) || 0} / {answer.marks_possible?.toFixed(1) || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">marks</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Your Answer:</div>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    {answer.user_answer || <em className="text-muted-foreground">No answer provided</em>}
                  </div>
                </div>

                {!answer.is_correct && question.answer && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Correct Answer:</div>
                    <div className="mt-1 p-3 bg-green-50 rounded-md text-green-900">
                      {question.answer}
                    </div>
                  </div>
                )}

                {answer.ai_feedback && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-blue-900">Feedback:</div>
                        <div className="text-sm text-blue-800 mt-1">{answer.ai_feedback}</div>
                      </div>
                    </div>
                  </div>
                )}

                {question.explanation && (
                  <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                    <div className="text-sm font-medium text-purple-900">Explanation:</div>
                    <div className="text-sm text-purple-800 mt-1">{question.explanation}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center pb-8">
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
        <Link href={`/quiz/${quizId}`}>
          <Button>Retake Quiz</Button>
        </Link>
      </div>
    </div>
  );
}
