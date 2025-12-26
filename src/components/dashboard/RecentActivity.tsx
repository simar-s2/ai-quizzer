import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
// import { ArrowRight } from "lucide-react" // Uncomment when statistics route is ready
import { Clock } from "lucide-react"

interface Attempt {
  id: string
  score: number
  completed_at: string | null
}

interface QuizWithAttempts {
  id: string
  title: string
  attempts?: Attempt[]
}

interface RecentActivityProps {
  quizzes: QuizWithAttempts[]
}

export function RecentActivity({ quizzes }: RecentActivityProps) {
  const recentAttempts = quizzes.filter((q) => q.attempts && q.attempts.length > 0).slice(0, 5)

  if (recentAttempts.length === 0) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No recent activity</p>
            <p className="text-sm text-muted-foreground">Complete a quiz to see your history</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        {/* Uncomment when statistics route is ready */}
        {/* <Link href="/statistics" className="text-sm text-primary hover:underline flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link> */}
      </CardHeader>
      <CardContent className="space-y-3">
        {recentAttempts.map((quiz) => {
          const latestAttempt = quiz.attempts?.[0]
          if (!latestAttempt?.completed_at) return null

          return (
            <Link key={latestAttempt.id} href={`/quiz/${quiz.id}/results/${latestAttempt.id}`}>
              <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-primary transition-colors">{quiz.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(latestAttempt.completed_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <Badge
                  variant={
                    latestAttempt.score >= 75 ? "default" : latestAttempt.score >= 50 ? "secondary" : "destructive"
                  }
                >
                  {latestAttempt.score.toFixed(0)}%
                </Badge>
              </div>
            </Link>
          )
        })}
      </CardContent>
    </Card>
  )
}
