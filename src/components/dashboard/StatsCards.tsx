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
    { 
      label: "Total Quizzes", 
      value: totalQuizzes, 
      icon: BookOpen, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { 
      label: "Completed", 
      value: completedQuizzes, 
      icon: Trophy, 
      color: "text-green-500", 
      bg: "bg-green-500/10" 
    },
    { 
      label: "Total Attempts", 
      value: totalAttempts, 
      icon: Target, 
      color: "text-purple-500", 
      bg: "bg-purple-500/10" 
    },
    {
      label: "Avg. Score",
      value: isNaN(averageScore) || averageScore === 0 ? "—" : `${Math.round(averageScore)}%`,
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

interface StreakCardProps {
  currentStreak: number
}

export function StreakCard({ currentStreak }: StreakCardProps) {
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
              <span className="text-4xl font-bold">{currentStreak}</span>
              <span className="text-muted-foreground">{currentStreak === 1 ? "day" : "days"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StudyTimeCardProps {
  studyTimeMinutes: number
}

export function StudyTimeCard({ studyTimeMinutes }: StudyTimeCardProps) {
  // Convert minutes to hours for display
  const hours = studyTimeMinutes / 60
  const displayValue = hours >= 1 ? hours.toFixed(1) : studyTimeMinutes
  const displayUnit = hours >= 1 ? "hours" : "minutes"

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center">
            <Clock className="h-7 w-7 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Study Time</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{displayValue}</span>
              <span className="text-muted-foreground">{displayUnit}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
