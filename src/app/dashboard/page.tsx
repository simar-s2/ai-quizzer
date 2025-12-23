"use client";
import { useState, useEffect, useRef } from "react";
import { createClient, Quiz } from "@/lib/supabase/client";
import { DataTable, getColumns } from "@/components/dataTable";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Spinner from "@/components/spinner";
import { deleteQuiz } from "@/lib/supabase/deleteQuiz";

const quizCache: Quiz[] = [];

export default function QuizzesPage() {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const [quizzes, setQuizzes] = useState<Quiz[]>(quizCache);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const hasFetched = useRef(false);

  const fetchQuizzes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      quizCache.splice(0, quizCache.length, ...data);
      setQuizzes(data);
    } else if (error) {
      toast.error("Failed to load quizzes", {
        description: error.message,
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (hasFetched.current) return;
    
    if (!authLoading) {
      if (quizCache.length === 0 && user) {
        hasFetched.current = true;
        fetchQuizzes();
      } else if (!user) {
        toast.error("Log in to see your quizzes", {
          description: "Please log in to view your quizzes.",
          duration: 3000,
        });
        setQuizzes([]);
      }
    }
  }, [authLoading, user]);

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? This action cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const result = await deleteQuiz(quizId);
      
      if (result.success) {
        toast.success("Quiz deleted successfully");
        // Remove from local state
        const updatedQuizzes = quizzes.filter((q) => q.id !== quizId);
        setQuizzes(updatedQuizzes);
        quizCache.splice(0, quizCache.length, ...updatedQuizzes);
      } else {
        toast.error("Failed to delete quiz", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Failed to delete quiz", {
        description: "An unexpected error occurred",
      });
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Loading quizzes</p>
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <DataTable
        columns={getColumns(
          (id) => router.push(`/quiz/${id}`),
          handleDeleteQuiz
        )}
        data={quizzes}
      />
    </div>
  );
}
