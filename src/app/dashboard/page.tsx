"use client";
import { useState, useEffect, useRef } from "react";
import { createClient, Quiz } from "@/lib/supabase/client";
import { DataTable, getColumns } from "@/components/dataTable";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Spinner from "@/components/spinner";

const quizCache: Quiz[] = [];

export default function QuizzesPage() {
  const router = useRouter();
  const supabase = useRef(createClient()).current;
  const [quizzes, setQuizzes] = useState<Quiz[]>(quizCache);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    
    if (!authLoading) {
      if (quizCache.length === 0 && user) {
        hasFetched.current = true;
        setLoading(true);
        
        supabase
          .from("quizzes")
          .select("*")
          .order("created_at", { ascending: false })
          .then(({ data, error }) => {
            if (!error && data) {
              quizCache.splice(0, quizCache.length, ...data);
              setQuizzes(data); // data is now typed as Quiz[]
            } else if (error) {
              toast.error("Failed to load quizzes", {
                description: error.message,
              });
            }
            setLoading(false);
          });
      } else if (!user) {
        toast.error("Log in to see your quizzes", {
          description: "Please log in to view your quizzes.",
          duration: 3000,
        });
        setQuizzes([]);
      }
    }
  }, [authLoading, user, supabase]);

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
        columns={getColumns((id) => router.push(`/quiz/${id}`))}
        data={quizzes}
      />
    </div>
  );
}