"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createClient, type Quiz } from "@/lib/supabase/client"
import { DataTable, getColumns } from "@/components/DataTable"
import { useAuth } from "@/components/AuthProvider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteQuiz } from "@/lib/supabase/deleteQuiz"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { StatsCards, StreakCard, StudyTimeCard } from "@/components/dashboard/StatsCards"
import {
  PerformanceChartPlaceholder,
  QuestionTypeChartPlaceholder,
  WeeklyActivityPlaceholder,
} from "@/components/dashboard/ChartPlaceholders"
import { RecentActivity } from "@/components/dashboard/RecentActivity"

interface QuizWithAttempts extends Quiz {
  attempts?: Array<{ id: string; score: number; completed_at: string | null }>
  best_score?: number | null
  attempts_count?: number
}

const quizCache: QuizWithAttempts[] = []

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [quizzes, setQuizzes] = useState<QuizWithAttempts[]>(quizCache)
  const [loading, setLoading] = useState(false)
  const { user, loading: authLoading } = useAuth()
  const hasFetched = useRef(false)

  const fetchQuizzes = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("quizzes")
      .select(`*, attempts (id, score, completed_at)`)
      .order("created_at", { ascending: false })
    if (!error && data) {
      const processedData = data.map((quiz) => {
        const attempts = quiz.attempts || []
        const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null
        return { ...quiz, best_score: bestScore, attempts_count: attempts.length }
      })
      quizCache.splice(0, quizCache.length, ...processedData)
      setQuizzes(processedData)
    } else if (error) toast.error("Failed to load quizzes")
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    if (hasFetched.current) return
    if (!authLoading) {
      if (!user) {
        router.push("/")
        return
      }
      if (quizCache.length === 0) {
        hasFetched.current = true
        fetchQuizzes()
      }
    }
  }, [authLoading, user, fetchQuizzes, router])

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Delete this quiz?")) return
    setLoading(true)
    try {
      const result = await deleteQuiz(quizId)
      if (result.success) {
        toast.success("Quiz deleted")
        const updated = quizzes.filter((q) => q.id !== quizId)
        setQuizzes(updated)
        quizCache.splice(0, quizCache.length, ...updated)
      } else toast.error("Failed to delete")
    } catch {
      toast.error("Failed to delete")
    } finally {
      setLoading(false)
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const totalQuizzes = quizzes.length
  const completedQuizzes = quizzes.filter((q) => q.status === "completed").length
  const totalAttempts = quizzes.reduce((sum, q) => sum + (q.attempts_count || 0), 0)
  const averageScore =
    quizzes.filter((q) => q.best_score !== null).reduce((sum, q) => sum + (q.best_score || 0), 0) /
    (quizzes.filter((q) => q.best_score !== null).length || 1)

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your progress and manage your quizzes</p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/#quiz-generator">
              <Plus className="h-4 w-4" />
              Create Quiz
            </Link>
          </Button>
        </div>

        <StatsCards
          totalQuizzes={totalQuizzes}
          completedQuizzes={completedQuizzes}
          totalAttempts={totalAttempts}
          averageScore={averageScore}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChartPlaceholder />
          </div>
          <div className="space-y-6">
            <StreakCard />
            <StudyTimeCard />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuestionTypeChartPlaceholder />
          <WeeklyActivityPlaceholder />
          <RecentActivity quizzes={quizzes} />
        </div>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle>Your Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <DataTable columns={getColumns((id) => router.push(`/quiz/${id}`), handleDeleteQuiz)} data={quizzes} />
              </TabsContent>
              <TabsContent value="completed" className="mt-4">
                <DataTable
                  columns={getColumns((id) => router.push(`/quiz/${id}`), handleDeleteQuiz)}
                  data={quizzes.filter((q) => q.status === "completed")}
                />
              </TabsContent>
              <TabsContent value="in-progress" className="mt-4">
                <DataTable
                  columns={getColumns((id) => router.push(`/quiz/${id}`), handleDeleteQuiz)}
                  data={quizzes.filter((q) => q.status === "in_progress")}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
