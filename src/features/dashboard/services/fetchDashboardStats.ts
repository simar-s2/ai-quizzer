"use server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface DashboardStats {
  totalQuizzes: number;
  completedQuizzes: number;
  inProgressQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  totalStudyTimeMinutes: number;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error("No authenticated user found");
  }

  // Fetch quizzes with attempts
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select(`
      id,
      status,
      attempts (
        id,
        score,
        time_taken,
        completed_at
      )
    `)
    .eq("user_id", user.id);

  // Fetch study streaks view
  const { data: streaks } = await supabase
    .from("study_streaks")
    .select("*")
    .eq("user_id", user.id)
    .order("study_date", { ascending: false })
    .limit(30);

  // Calculate stats
  const totalQuizzes = quizzes?.length || 0;
  const completedQuizzes = quizzes?.filter(q => q.status === "completed").length || 0;
  const inProgressQuizzes = quizzes?.filter(q => q.status === "in_progress").length || 0;
  
  const allAttempts = quizzes?.flatMap(q => q.attempts || []) || [];
  const totalAttempts = allAttempts.length;
  
  // Calculate average score using the BEST score from each quiz that has attempts
  const quizzesWithAttempts = quizzes?.filter(q => q.attempts && q.attempts.length > 0) || [];
  const bestScoresPerQuiz = quizzesWithAttempts.map(quiz => {
    const attempts = quiz.attempts || [];
    return Math.max(...attempts.map(a => a.score));
  });
  
  const averageScore = bestScoresPerQuiz.length > 0
    ? bestScoresPerQuiz.reduce((sum, score) => sum + score, 0) / bestScoresPerQuiz.length
    : 0;
  
  // Calculate best score across all attempts
  const bestScore = totalAttempts > 0
    ? Math.max(...allAttempts.map(a => a.score))
    : 0;
  
  // Calculate total study time in minutes from attempts
  const totalStudyTimeSeconds = allAttempts.reduce((sum, attempt) => {
    return sum + (attempt.time_taken || 0);
  }, 0);
  const totalStudyTimeMinutes = Math.round(totalStudyTimeSeconds / 60);

  // Calculate current streak
  const currentStreak = calculateStreak(streaks || []);

  return {
    totalQuizzes,
    completedQuizzes,
    inProgressQuizzes,
    totalAttempts,
    averageScore,
    bestScore,
    currentStreak,
    totalStudyTimeMinutes,
  };
}

function calculateStreak(streaks: Array<{ study_date: string | null }>): number {
  if (!streaks || streaks.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if there's activity today or yesterday to start the streak
  const mostRecentDate = streaks[0]?.study_date ? new Date(streaks[0].study_date) : null;
  if (!mostRecentDate) return 0;

  mostRecentDate.setHours(0, 0, 0, 0);
  const daysDiff = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // If last activity was more than 1 day ago, streak is broken
  if (daysDiff > 1) return 0;

  // Count consecutive days
  for (let i = 0; i < streaks.length; i++) {
    const currentDate = streaks[i]?.study_date ? new Date(streaks[i].study_date!) : null;
    if (!currentDate) break;
    
    currentDate.setHours(0, 0, 0, 0);
    
    if (i === 0) {
      streak = 1;
      continue;
    }

    const prevDate = streaks[i - 1]?.study_date ? new Date(streaks[i - 1].study_date!) : null;
    if (!prevDate) break;
    
    prevDate.setHours(0, 0, 0, 0);
    const diff = Math.floor((prevDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
