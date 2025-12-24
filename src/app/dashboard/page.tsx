"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { createClient, Quiz } from "@/lib/supabase/client";
import { DataTable, getColumns } from "@/components/dataTable";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Spinner from "@/components/Spinner";
import { deleteQuiz } from "@/lib/supabase/deleteQuiz";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface QuizWithAttempts extends Quiz {
  attempts?: Array<{
    id: string;
    score: number;
    completed_at: string | null;
  }>;
  best_score?: number | null;
  attempts_count?: number;
}

const quizCache: QuizWithAttempts[] = [];

export default function QuizzesPage() {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const [quizzes, setQuizzes] = useState<QuizWithAttempts[]>(quizCache);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const hasFetched = useRef(false);

  const fetchQuizzes = useCallback(async () => {
    setLoading(true);

    // Fetch quizzes with their attempts
    const { data, error } = await supabase
      .from("quizzes")
      .select(
        `
        *,
        attempts (
          id,
          score,
          completed_at
        )
      `
      )
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Process data to add best_score and attempts_count
      const processedData = data.map((quiz) => {
        const attempts = quiz.attempts || [];
        const bestScore =
          attempts.length > 0
            ? Math.max(...attempts.map((a) => a.score))
            : null;

        return {
          ...quiz,
          best_score: bestScore,
          attempts_count: attempts.length,
        };
      });

      quizCache.splice(0, quizCache.length, ...processedData);
      setQuizzes(processedData);
    } else if (error) {
      toast.error("Failed to load quizzes", {
        description: error.message,
      });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (hasFetched.current) return;

    if (!authLoading) {
      if (quizCache.length === 0 && user) {
        hasFetched.current = true;
        fetchQuizzes();
      } else if (!user) {
        toast.error("Log in to see your quizzes", {
          description: "Please log in to view your quizzes.",
          duration: 3000,
        });
        setQuizzes([]);
      }
    }
  }, [authLoading, user, fetchQuizzes]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this quiz? This action cannot be undone."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteQuiz(quizId);

      if (result.success) {
        toast.success("Quiz deleted successfully");
        const updatedQuizzes = quizzes.filter((q) => q.id !== quizId);
        setQuizzes(updatedQuizzes);
        quizCache.splice(0, quizCache.length, ...updatedQuizzes);
      } else {
        toast.error("Failed to delete quiz", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Failed to delete quiz", {
        description: "An unexpected error occurred",
      });
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Loading quizzes</p>
          <Spinner />
        </div>
      </div>
    );
  }

  // Statistics
  const totalQuizzes = quizzes.length;
  const completedQuizzes = quizzes.filter(
    (q) => q.status === "completed"
  ).length;
  const totalAttempts = quizzes.reduce(
    (sum, q) => sum + (q.attempts_count || 0),
    0
  );
  const averageScore =
    quizzes
      .filter((q) => q.best_score !== null)
      .reduce((sum, q) => sum + (q.best_score || 0), 0) /
    (quizzes.filter((q) => q.best_score !== null).length || 1);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">View and manage your quizzes</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Quizzes</CardDescription>
            <CardTitle className="text-3xl">{totalQuizzes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Completed</CardDescription>
            <CardTitle className="text-3xl">{completedQuizzes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Attempts</CardDescription>
            <CardTitle className="text-3xl">{totalAttempts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Average Score</CardDescription>
            <CardTitle className="text-3xl">
              {isNaN(averageScore) ? "N/A" : `${averageScore.toFixed(1)}%`}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Quizzes</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <DataTable
            columns={getColumns(
              (id) => router.push(`/quiz/${id}`),
              handleDeleteQuiz
            )}
            data={quizzes}
          />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <DataTable
            columns={getColumns(
              (id) => router.push(`/quiz/${id}`),
              handleDeleteQuiz
            )}
            data={quizzes.filter((q) => q.status === "completed")}
          />
        </TabsContent>

        <TabsContent value="in-progress" className="mt-6">
          <DataTable
            columns={getColumns(
              (id) => router.push(`/quiz/${id}`),
              handleDeleteQuiz
            )}
            data={quizzes.filter((q) => q.status === "in_progress")}
          />
        </TabsContent>
      </Tabs>

      {/* Recent Attempts Section */}
      {quizzes.some((q) => q.attempts && q.attempts.length > 0) && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Recent Attempts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes
              .filter((q) => q.attempts && q.attempts.length > 0)
              .slice(0, 6)
              .map((quiz) => {
                const latestAttempt = quiz.attempts?.[0];
                if (!latestAttempt || !latestAttempt.completed_at) return null;

                return (
                  <Link
                    key={latestAttempt.id}
                    href={`/quiz/${quiz.id}/results/${latestAttempt.id}`}
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg truncate">
                          {quiz.title}
                        </CardTitle>
                        <CardDescription>
                          {new Date(
                            latestAttempt.completed_at
                          ).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Score:
                          </span>
                          <Badge
                            variant={
                              latestAttempt.score >= 75
                                ? "default"
                                : latestAttempt.score >= 50
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {latestAttempt.score.toFixed(1)}%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
