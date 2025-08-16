"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Quiz } from "@/app/types";
import { DataTable, getColumns } from "@/components/dataTable";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Spinner from "@/components/Spinner"; // Assuming you have a Spinner component

const quizCache: Quiz[] = [];

export default function QuizzesPage() {
  const router = useRouter();
  const supabase = useRef(createClient()).current; // stable ref so it doesn't trigger useEffect
  const [quizzes, setQuizzes] = useState<Quiz[]>(quizCache);
  const [loading, setLoading] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return; // prevent re-fetch
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
              quizCache.splice(0, quizCache.length, ...data); // update cache
              setQuizzes(data);
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
  }, [authLoading, user]);

  if (loading || authLoading) return (<div>
    <p>Loading quizzes</p>
    <Spinner></Spinner>
  </div>);

  return (
    <div className="p-4">
      <DataTable
        columns={getColumns((id) => router.push(`/quiz/${id}`))}
        data={quizzes}
      />
    </div>
  );
}

