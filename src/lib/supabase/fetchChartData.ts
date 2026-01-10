"use server";
import { createServerSupabaseClient } from "./server";

export interface PerformanceData {
  date: string;
  score: number;
  quizTitle: string;
}

export interface QuestionTypeData {
  type: string;
  count: number;
  percentage: number;
}

export interface WeeklyActivityData {
  day: string;
  count: number;
}

export async function fetchPerformanceData(): Promise<PerformanceData[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("No authenticated user found");
  }

  // Fetch attempts from the last 30 days with quiz titles
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: attempts } = await supabase
    .from("attempts")
    .select(`
      score,
      completed_at,
      quizzes (
        title
      )
    `)
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .gte("completed_at", thirtyDaysAgo.toISOString())
    .order("completed_at", { ascending: true });

  if (!attempts) return [];

  return attempts.map(attempt => {
    const quiz = attempt.quizzes as { title: string } | null;
    return {
      date: attempt.completed_at ? new Date(attempt.completed_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '',
      score: attempt.score,
      quizTitle: quiz?.title || 'Unknown Quiz',
    };
  });
}

export async function fetchQuestionTypeData(): Promise<QuestionTypeData[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("No authenticated user found");
  }

  // Fetch question type performance from view
  const { data: questionTypes } = await supabase
    .from("question_type_performance")
    .select("*")
    .eq("user_id", user.id);

  if (!questionTypes || questionTypes.length === 0) return [];

  const total = questionTypes.reduce((sum, qt) => sum + (qt.questions_answered || 0), 0);

  return questionTypes.map(qt => ({
    type: formatQuestionType(qt.question_type || ''),
    count: qt.questions_answered || 0,
    percentage: total > 0 ? Math.round(((qt.questions_answered || 0) / total) * 100) : 0,
  }));
}

export async function fetchWeeklyActivityData(): Promise<WeeklyActivityData[]> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("No authenticated user found");
  }

  // Get last 7 days of activity
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: streaks } = await supabase
    .from("study_streaks")
    .select("*")
    .eq("user_id", user.id)
    .gte("study_date", sevenDaysAgo.toISOString().split('T')[0])
    .order("study_date", { ascending: true });

  // Create array for last 7 days
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result: WeeklyActivityData[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayName = days[date.getDay()];
    
    const streak = streaks?.find(s => s.study_date === dateStr);
    result.push({
      day: dayName,
      count: streak?.quizzes_completed || 0,
    });
  }

  return result;
}

function formatQuestionType(type: string): string {
  const typeMap: Record<string, string> = {
    'mcq': 'Multiple Choice',
    'fill': 'Fill in Blank',
    'truefalse': 'True/False',
    'shortanswer': 'Short Answer',
    'essay': 'Essay',
  };
  return typeMap[type] || type;
}
