"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Quiz } from "@/app/types";
import { DataTable, columns } from "@/components/dataTable"; // your table component
import { useAuth } from "@/components/AuthProvider";

// Local page-level store (static so it persists while the app is running)
let quizCache: Quiz[] = [];

export default function QuizzesPage() {
  const supabase = createClient();
  const [quizzes, setQuizzes] = useState<Quiz[]>(quizCache);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only fetch if cache is empty
    if (quizCache.length === 0 && user) {
      setLoading(true);
      supabase
        .from("quizzes")
        .select("*")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!error && data) {
            quizCache = data; // store in memory
            setQuizzes(data);
          }
          setLoading(false);
        });
    } else {
      setQuizzes(quizCache);
    }
  }, []);

  if (loading) return <div>Loading quizzes...</div>;

  return (
    <div className="p-4">
      <DataTable columns={columns} data={quizzes} />
    </div>
  );
}
