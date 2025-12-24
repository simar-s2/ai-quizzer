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
      answers: {
        Row: {
          id: string
          is_correct: boolean | null
          question_id: string | null
          quiz_id: string | null
          score: number | null
          submitted_at: string | null
          user_answer: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          quiz_id?: string | null
          score?: number | null
          submitted_at?: string | null
          user_answer?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          is_correct?: boolean | null
          question_id?: string | null
          quiz_id?: string | null
          score?: number | null
          submitted_at?: string | null
          user_answer?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      attempt_answers: {
        Row: {
          ai_feedback: string | null
          attempt_id: string | null
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
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
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
    }
    Views: {
      [_ in never]: never
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
