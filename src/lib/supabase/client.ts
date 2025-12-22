import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Type helpers
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type InsertDto<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type UpdateDto<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T]

// Specific types for your app
export type Quiz = Tables<'quizzes'>
export type Question = Tables<'questions'>
export type Answer = Tables<'answers'>

export type QuizInsert = InsertDto<'quizzes'>
export type QuestionInsert = InsertDto<'questions'>
export type AnswerInsert = InsertDto<'answers'>

// Enum types
export type QuestionType = Enums<'question_type'>
export type DifficultyLevel = Enums<'difficulty_level'>
export type QuizStatus = Enums<'quiz_status'>
export type VisibilityStatus = Enums<'visibility_status'>