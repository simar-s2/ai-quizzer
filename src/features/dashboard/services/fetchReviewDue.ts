"use server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface ReviewDueItem {
  quiz_id: string;
  quiz_title: string;
  quiz_subject: string | null;
  quiz_difficulty: string;
  last_score: number;
  next_review_at: string;
  interval_days: number;
}

export async function fetchReviewsDue(): Promise<ReviewDueItem[]> {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("quiz_srs_state")
    .select("*")
    .eq("user_id", user.id)
    .lte("next_review_at", now) // due now or overdue
    .order("next_review_at", { ascending: true });

  if (error || !data) return [];

  return data
  .filter((row) => row.quiz_id && row.quiz_title && row.next_review_at && row.interval_days !== null && row.score !== null)
  .map((row) => ({
    quiz_id: row.quiz_id!,
    quiz_title: row.quiz_title!,
    quiz_subject: row.quiz_subject,
    quiz_difficulty: row.quiz_difficulty ?? "medium",
    last_score: row.score!,
    next_review_at: row.next_review_at!,
    interval_days: row.interval_days!,
  }));
}