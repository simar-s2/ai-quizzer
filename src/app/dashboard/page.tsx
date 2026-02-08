"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { deleteQuiz } from "@/features/quiz/services/deleteQuiz"
import { fetchDashboardStats } from "@/features/dashboard/services/fetchDashboardStats"
import { fetchPerformanceData, fetchQuestionTypeData, fetchWeeklyActivityData } from "@/features/dashboard/services/fetchChartData"
import type { PerformanceData, QuestionTypeData, WeeklyActivityData } from "@/features/dashboard/services/fetchChartData"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { StatsCards, StreakCard, StudyTimeCard } from "@/features/dashboard/components/StatsCards"
import { PerformanceChart, QuestionTypeChart, WeeklyActivityChart } from "@/features/dashboard/components/Charts"
import { RecentActivity } from "@/features/dashboard/components/RecentActivity"
import { createClient, type Quiz } from "@/lib/supabase/client"
import { DataTable, getColumns } from "@/features/dashboard/components/DataTable"

interface QuizWithAttempts extends Quiz {
  attempts?: Array<{ id: string; score: number; completed_at: string | null }>
  best_score?: number | null
  attempts_count?: number
}

export default function DashboardPage() {
  const router = useRouter()
  const supabase = useRef(createClient()).current
  const [quizzes, setQuizzes] = useState<QuizWithAttempts[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    inProgressQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    bestScore: 0,
    currentStreak: 0,
    totalStudyTimeMinutes: 0,
  })
  const [chartData, setChartData] = useState<{
    performance: PerformanceData[]
    questionTypes: QuestionTypeData[]
    weeklyActivity: WeeklyActivityData[]
  }>({
    performance: [],
    questionTypes: [],
    weeklyActivity: [],
  })
  const { user, loading: authLoading } = useAuth()
  const hasFetched = useRef(false)

  useEffect(() => {
    if (hasFetched.current || authLoading) return
    
    if (!user) {
      router.push("/")
      return
    }

    hasFetched.current = true
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user, router])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const dashboardStats = await fetchDashboardStats()
      setStats(dashboardStats)

      // Fetch chart data
      const [performance, questionTypes, weeklyActivity] = await Promise.all([
        fetchPerformanceData(),
        fetchQuestionTypeData(),
        fetchWeeklyActivityData(),
      ])

      setChartData({
        performance,
        questionTypes,
        weeklyActivity,
      })

      // Fetch quizzes for the table
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
        setQuizzes(processedData)
      } else if (error) {
        toast.error("Failed to load quizzes")
      }
    } catch (error) {
      console.error("Error loading dashboard:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Delete this quiz?")) return
    try {
      const result = await deleteQuiz(quizId)
      if (result.success) {
        toast.success("Quiz deleted")
        // Reload dashboard data to update stats
        await loadDashboardData()
      } else {
        toast.error("Failed to delete")
      }
    } catch {
      toast.error("Failed to delete")
    }
  }

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

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
          totalQuizzes={stats.totalQuizzes}
          completedQuizzes={stats.completedQuizzes}
          totalAttempts={stats.totalAttempts}
          averageScore={stats.averageScore}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PerformanceChart data={chartData.performance} />
          </div>
          <div className="space-y-6">
            <StreakCard currentStreak={stats.currentStreak} />
            <StudyTimeCard studyTimeMinutes={stats.totalStudyTimeMinutes} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <QuestionTypeChart data={chartData.questionTypes} />
          <WeeklyActivityChart data={chartData.weeklyActivity} />
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
