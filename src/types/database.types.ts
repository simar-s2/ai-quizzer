export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      attempt_answers: {
        Row: {
          ai_feedback: string | null
          attempt_id: string | null
          correctness_status: string | null
          created_at: string | null
          id: string
          is_correct: boolean | null
          marks_awarded: number | null
          marks_possible: number | null
          question_id: string | null
          user_answer: string | null
        }
        Insert: {
          ai_feedback?: string | null
          attempt_id?: string | null
          correctness_status?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          marks_awarded?: number | null
          marks_possible?: number | null
          question_id?: string | null
          user_answer?: string | null
        }
        Update: {
          ai_feedback?: string | null
          attempt_id?: string | null
          correctness_status?: string | null
          created_at?: string | null
          id?: string
          is_correct?: boolean | null
          marks_awarded?: number | null
          marks_possible?: number | null
          question_id?: string | null
          user_answer?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempt_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "recent_activity"
            referencedColumns: ["attempt_id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "question_performance"
            referencedColumns: ["question_id"]
          },
          {
            foreignKeyName: "attempt_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      attempts: {
        Row: {
          completed_at: string | null
          created_at: string | null
          feedback: Json | null
          id: string
          marks_obtained: number
          quiz_id: string | null
          score: number
          time_taken: number | null
          total_marks: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          marks_obtained: number
          quiz_id?: string | null
          score: number
          time_taken?: number | null
          total_marks: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          marks_obtained?: number
          quiz_id?: string | null
          score?: number
          time_taken?: number | null
          total_marks?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quiz_performance_stats"
            referencedColumns: ["quiz_id"]
          },
          {
            foreignKeyName: "attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "recent_activity"
            referencedColumns: ["quiz_id"]
          },
        ]
      }
      questions: {
        Row: {
          answer: string | null
          created_at: string | null
          explanation: string | null
          id: string
          marks: number | null
          options: Json | null
          question_text: string
          quiz_id: string | null
          type: Database["public"]["Enums"]["question_type"]
          updated_at: string | null
          visibility: Database["public"]["Enums"]["visibility_status"] | null
        }
        Insert: {
          answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          marks?: number | null
          options?: Json | null
          question_text: string
          quiz_id?: string | null
          type: Database["public"]["Enums"]["question_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visibility_status"] | null
        }
        Update: {
          answer?: string | null
          created_at?: string | null
          explanation?: string | null
          id?: string
          marks?: number | null
          options?: Json | null
          question_text?: string
          quiz_id?: string | null
          type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["visibility_status"] | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          metadata: Json | null
          status: Database["public"]["Enums"]["quiz_status"] | null
          subject: string | null
          tags: string[] | null
          title: string
          total_marks: number | null
          total_time: number | null
          updated_at: string | null
          user_id: string | null
          visibility: Database["public"]["Enums"]["visibility_status"] | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["quiz_status"] | null
          subject?: string | null
          tags?: string[] | null
          title: string
          total_marks?: number | null
          total_time?: number | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_status"] | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          metadata?: Json | null
          status?: Database["public"]["Enums"]["quiz_status"] | null
          subject?: string | null
          tags?: string[] | null
          title?: string
          total_marks?: number | null
          total_time?: number | null
          updated_at?: string | null
          user_id?: string | null
          visibility?: Database["public"]["Enums"]["visibility_status"] | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_submit: boolean | null
          created_at: string | null
          daily_goal: number | null
          default_difficulty:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          default_question_count: number | null
          email_notifications: boolean | null
          language: string | null
          preferred_study_time: string | null
          quiz_reminders: boolean | null
          settings: Json | null
          show_explanations: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auto_submit?: boolean | null
          created_at?: string | null
          daily_goal?: number | null
          default_difficulty?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          default_question_count?: number | null
          email_notifications?: boolean | null
          language?: string | null
          preferred_study_time?: string | null
          quiz_reminders?: boolean | null
          settings?: Json | null
          show_explanations?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auto_submit?: boolean | null
          created_at?: string | null
          daily_goal?: number | null
          default_difficulty?:
            | Database["public"]["Enums"]["difficulty_level"]
            | null
          default_question_count?: number | null
          email_notifications?: boolean | null
          language?: string | null
          preferred_study_time?: string | null
          quiz_reminders?: boolean | null
          settings?: Json | null
          show_explanations?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      difficulty_performance: {
        Row: {
          attempts_at_difficulty: number | null
          average_score: number | null
          best_score: number | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          high_scores_count: number | null
          low_scores_count: number | null
          medium_scores_count: number | null
          user_id: string | null
        }
        Relationships: []
      }
      question_performance: {
        Row: {
          adjusted_success_rate_percentage: number | null
          average_marks_awarded: number | null
          marks_possible: number | null
          question_id: string | null
          question_text: string | null
          question_type: Database["public"]["Enums"]["question_type"] | null
          quiz_id: string | null
          success_rate_percentage: number | null
          times_answered: number | null
          times_correct: number | null
          times_incorrect: number | null
          times_partial: number | null
        }
        Relationships: []
      }
      question_type_performance: {
        Row: {
          average_marks_earned: number | null
          question_type: Database["public"]["Enums"]["question_type"] | null
          questions_answered: number | null
          questions_correct: number | null
          questions_incorrect: number | null
          questions_partial: number | null
          success_rate_percentage: number | null
          user_id: string | null
        }
        Relationships: []
      }
      quiz_performance_stats: {
        Row: {
          average_score: number | null
          average_time_seconds: number | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          highest_score: number | null
          lowest_score: number | null
          quiz_id: string | null
          subject: string | null
          title: string | null
          total_attempts: number | null
        }
        Relationships: []
      }
      recent_activity: {
        Row: {
          activity_rank: number | null
          attempt_id: string | null
          completed_at: string | null
          difficulty: Database["public"]["Enums"]["difficulty_level"] | null
          marks_obtained: number | null
          quiz_id: string | null
          quiz_title: string | null
          score: number | null
          subject: string | null
          time_taken: number | null
          total_marks: number | null
          user_id: string | null
        }
        Relationships: []
      }
      study_streaks: {
        Row: {
          daily_average_score: number | null
          quizzes_completed: number | null
          study_date: string | null
          total_study_time_seconds: number | null
          user_id: string | null
        }
        Relationships: []
      }
      subject_performance: {
        Row: {
          attempts_in_subject: number | null
          average_score: number | null
          best_score: number | null
          lowest_score: number | null
          quizzes_in_subject: number | null
          subject: string | null
          user_id: string | null
        }
        Relationships: []
      }
      user_quiz_stats: {
        Row: {
          average_score: number | null
          best_score: number | null
          lowest_score: number | null
          quizzes_attempted: number | null
          total_attempts: number | null
          total_time_spent_seconds: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: "easy" | "medium" | "hard" | "expert"
      mcq_option: "a" | "b" | "c" | "d"
      question_type: "mcq" | "fill" | "truefalse" | "shortanswer" | "essay"
      quiz_status: "not_started" | "in_progress" | "completed"
      visibility_status: "public" | "private" | "unlisted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      difficulty_level: ["easy", "medium", "hard", "expert"],
      mcq_option: ["a", "b", "c", "d"],
      question_type: ["mcq", "fill", "truefalse", "shortanswer", "essay"],
      quiz_status: ["not_started", "in_progress", "completed"],
      visibility_status: ["public", "private", "unlisted"],
    },
  },
} as const
