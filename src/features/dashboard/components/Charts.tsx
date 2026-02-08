"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { PerformanceData, QuestionTypeData, WeeklyActivityData } from "@/features/dashboard/services/fetchChartData"
import { useTheme } from "next-themes"

interface PerformanceChartProps {
  data: PerformanceData[]
}

export function PerformanceChart({ data }: PerformanceChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

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
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.5} />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
              stroke={isDark ? '#374151' : '#d1d5db'}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
              stroke={isDark ? '#374151' : '#d1d5db'}
              domain={[0, 100]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
              labelStyle={{ color: isDark ? '#f3f4f6' : '#111827' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              dot={{ fill: isDark ? '#60a5fa' : 'hsl(var(--primary))', r: 4, stroke: isDark ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
              activeDot={{ r: 6, fill: isDark ? '#60a5fa' : 'hsl(var(--primary))', stroke: isDark ? '#1f2937' : '#ffffff', strokeWidth: 2 }}
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

const COLORS_LIGHT = [
  'hsl(217, 91%, 60%)',  // Blue
  'hsl(142, 71%, 45%)',  // Green
  'hsl(262, 83%, 58%)',  // Purple
  'hsl(38, 92%, 50%)',   // Amber
  'hsl(346, 77%, 50%)',  // Rose
]

const COLORS_DARK = [
  'hsl(217, 91%, 70%)',  // Lighter Blue
  'hsl(142, 71%, 55%)',  // Lighter Green
  'hsl(262, 83%, 68%)',  // Lighter Purple
  'hsl(38, 92%, 60%)',   // Lighter Amber
  'hsl(346, 77%, 60%)',  // Lighter Rose
]

export function QuestionTypeChart({ data }: QuestionTypeChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  if (!data || data.length === 0) {
    return <QuestionTypeChartPlaceholder message="No question type data yet. Answer some questions to see the breakdown!" />
  }

  // Transform data to include index signature for recharts
  const chartData = data.map(item => ({ ...item, name: item.type }))
  const colors = isDark ? COLORS_DARK : COLORS_LIGHT

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
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
              itemStyle={{
                color: isDark ? '#f3f4f6' : '#111827'
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
              wrapperStyle={{ color: isDark ? '#f3f4f6' : '#111827' }}
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
  const { theme } = useTheme()
  const isDark = theme === 'dark'

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
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} opacity={0.5} />
            <XAxis 
              dataKey="day" 
              className="text-xs"
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
              stroke={isDark ? '#374151' : '#d1d5db'}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: isDark ? '#9ca3af' : '#6b7280' }}
              stroke={isDark ? '#374151' : '#d1d5db'}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px',
                fontSize: '12px',
                color: isDark ? '#f3f4f6' : '#111827'
              }}
              cursor={{ fill: isDark ? '#374151' : '#f3f4f6', opacity: 0.1 }}
              labelFormatter={(label: string) => `${label}`}
              formatter={(value) => {
                const count = value ? (typeof value === 'number' ? value : parseInt(String(value))) : 0;
                return [`${count} quiz${count !== 1 ? 'zes' : ''}`, 'Completed'];
              }}
            />
            <Bar 
              dataKey="count" 
              fill={isDark ? 'hsl(217, 91%, 70%)' : 'hsl(var(--primary))'}
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
