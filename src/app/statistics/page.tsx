"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, BarChart3, PieChart, TrendingUp, Target, Award, Clock, Brain, Zap, Calendar } from "lucide-react"
import Link from "next/link"

export default function StatisticsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Statistics</h1>
            <p className="text-muted-foreground mt-1">Detailed analytics of your learning journey</p>
          </div>
          <div className="flex items-center gap-3">
            <Select defaultValue="30d">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">Export Report</Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Score", value: "78%", change: "+5%", icon: TrendingUp, color: "text-green-500" },
            { label: "Questions Answered", value: "342", change: "+48", icon: Target, color: "text-blue-500" },
            { label: "Perfect Scores", value: "12", change: "+3", icon: Award, color: "text-amber-500" },
            { label: "Study Time", value: "24h", change: "+6h", icon: Clock, color: "text-purple-500" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-card/50 border-border/50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Trend Chart Placeholder */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>Score Trend</CardTitle>
                  <CardDescription>Your average score over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
                    <div className="text-center">
                      <LineChart className="h-12 w-12 text-primary mx-auto mb-3" />
                      <p className="font-medium">Score Trend Chart</p>
                      <p className="text-sm text-muted-foreground">Connect database to see your data</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Heatmap Placeholder */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle>Activity Heatmap</CardTitle>
                  <CardDescription>Your study activity calendar</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="font-medium">Activity Heatmap</p>
                      <p className="text-sm text-muted-foreground">Track your daily progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Question Type Distribution */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Question Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
                    <div className="text-center">
                      <PieChart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Distribution chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Difficulty Breakdown */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Difficulty Levels</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
                    <div className="text-center">
                      <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Breakdown chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths & Weaknesses */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-base">Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
                    <div className="text-center">
                      <Brain className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">AI-powered insights</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-16 text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Performance Analytics</h3>
                <p className="text-muted-foreground mb-4">Detailed performance metrics and trends</p>
                <Button variant="outline" asChild>
                  <Link href="/#quiz-generator">Take a Quiz to Generate Data</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="topics">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-16 text-center">
                <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Topic Analysis</h3>
                <p className="text-muted-foreground mb-4">See which topics you excel at and which need work</p>
                <Button variant="outline" asChild>
                  <Link href="/#quiz-generator">Start Learning</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-16 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Quiz History</h3>
                <p className="text-muted-foreground mb-4">Complete history of all your quiz attempts</p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
