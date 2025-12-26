import { Card, CardContent } from "@/components/ui/card"
import { Target, Trophy, TrendingUp, Clock, Flame, BookOpen } from "lucide-react"

interface StatsCardsProps {
  totalQuizzes: number
  completedQuizzes: number
  totalAttempts: number
  averageScore: number
}

export function StatsCards({ totalQuizzes, completedQuizzes, totalAttempts, averageScore }: StatsCardsProps) {
  const stats = [
    { label: "Total Quizzes", value: totalQuizzes, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Completed", value: completedQuizzes, icon: Trophy, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Attempts", value: totalAttempts, icon: Target, color: "text-purple-500", bg: "bg-purple-500/10" },
    {
      label: "Avg. Score",
      value: isNaN(averageScore) ? "—" : `${averageScore.toFixed(0)}%`,
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="bg-card/50 border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function StreakCard() {
  return (
    <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-primary/20 flex items-center justify-center">
            <Flame className="h-7 w-7 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Streak</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">7</span>
              <span className="text-muted-foreground">days</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StudyTimeCard() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Clock className="h-7 w-7 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Study Time This Week</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">4.5</span>
              <span className="text-muted-foreground">hours</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
