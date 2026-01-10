"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { PerformanceData, QuestionTypeData, WeeklyActivityData } from "@/lib/supabase/fetchChartData"

interface PerformanceChartProps {
  data: PerformanceData[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  if (!data || data.length === 0) {
    return <PerformanceChartPlaceholder message="No performance data yet. Complete some quizzes to see your progress!" />
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Performance Over Time</CardTitle>
        <CardDescription>Your quiz scores for the past 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface QuestionTypeChartProps {
  data: QuestionTypeData[]
}

const COLORS = [
  'hsl(217, 91%, 60%)',  // Blue
  'hsl(142, 71%, 45%)',  // Green
  'hsl(262, 83%, 58%)',  // Purple
  'hsl(38, 92%, 50%)',   // Amber
  'hsl(346, 77%, 50%)',  // Rose
]

export function QuestionTypeChart({ data }: QuestionTypeChartProps) {
  if (!data || data.length === 0) {
    return <QuestionTypeChartPlaceholder message="No question type data yet. Answer some questions to see the breakdown!" />
  }

  // Transform data to include index signature for recharts
  const chartData = data.map(item => ({ ...item, name: item.type }))

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Question Types</CardTitle>
        <CardDescription>Breakdown by question type</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false}
              outerRadius={70}
              fill="hsl(var(--primary))"
              dataKey="count"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              formatter={(value, name, props) => {
                const payload = props.payload as QuestionTypeData & { name: string };
                const percentage = payload.percentage;
                const displayValue = value ?? 0;
                return [`${displayValue} (${percentage}%)`, payload.type];
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value, entry) => {
                const payload = entry.payload as QuestionTypeData & { name: string };
                const item = data.find(d => d.type === payload.type);
                return `${item?.type}: ${item?.percentage}%`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface WeeklyActivityChartProps {
  data: WeeklyActivityData[]
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  if (!data || data.length === 0) {
    return <WeeklyActivityChartPlaceholder message="No activity data for this week yet!" />
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Activity</CardTitle>
        <CardDescription>Quizzes completed each day</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
            <XAxis 
              dataKey="day" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              stroke="hsl(var(--border))"
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              cursor={{ fill: 'hsl(var(--muted))', opacity: 0.1 }}
              labelFormatter={(label: string) => `${label}`}
              formatter={(value) => {
                const count = value ? (typeof value === 'number' ? value : parseInt(String(value))) : 0;
                return [`${count} quiz${count !== 1 ? 'zes' : ''}`, 'Completed'];
              }}
            />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--primary))" 
              radius={[8, 8, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// Placeholder components when no data
function PerformanceChartPlaceholder({ message }: { message: string }) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Performance Over Time</CardTitle>
        <CardDescription>Your quiz scores for the past 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground text-center px-4">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function QuestionTypeChartPlaceholder({ message }: { message: string }) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Question Types</CardTitle>
        <CardDescription>Breakdown by question type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground text-center px-4">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function WeeklyActivityChartPlaceholder({ message }: { message: string }) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Weekly Activity</CardTitle>
        <CardDescription>Quizzes completed each day</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] flex items-center justify-center border border-dashed border-border rounded-lg bg-muted/20">
          <p className="text-sm text-muted-foreground text-center px-4">{message}</p>
        </div>
      </CardContent>
    </Card>
  )
}
