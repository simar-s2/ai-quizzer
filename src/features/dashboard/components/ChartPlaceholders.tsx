import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, LineChart, PieChart } from "lucide-react"

export function PerformanceChartPlaceholder() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Performance Over Time</CardTitle>
        <CardDescription>Your quiz scores for the past 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
          <div className="text-center">
            <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Performance Chart</p>
            <p className="text-xs text-muted-foreground">Data visualization coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function QuestionTypeChartPlaceholder() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Question Types</CardTitle>
        <CardDescription>Breakdown by question type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
          <div className="text-center">
            <PieChart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Distribution Chart</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WeeklyActivityPlaceholder() {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Activity</CardTitle>
        <CardDescription>Quizzes completed each day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
          <div className="text-center">
            <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-muted-foreground">Activity Chart</p>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
