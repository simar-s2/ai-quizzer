"use client";
import React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportQuizQuestions, exportQuizMarkscheme } from "../lib/quizExport";
import { Quiz, Question } from "@/lib/supabase/client";
import { saveQuiz } from "../lib/supabase/saveQuiz";
import { toast } from "sonner";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "next/navigation";

export function ExportQuizButtons({
  quiz,
  questions,
}: {
  quiz: Quiz;
  questions: Question[];
}) {
  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={() => {
          exportQuizQuestions(questions, quiz);
          toast.success("Quiz exported successfully!");
        }}
      >
        Export Quiz
      </Button>
      <Button
        variant="outline"
        onClick={() => exportQuizMarkscheme(questions, quiz)}
      >
        Export Markscheme
      </Button>
    </div>
  );
}

export function QuizStartButton({
  quiz,
  questions,
}: {
  quiz: Quiz;
  questions: Question[];
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      disabled={loading}
      onClick={async () => {
        if (!user) {
          toast.error("Please log in to start the quiz");
          return;
        }
        if (!quiz || !questions.length) {
          toast.error("Quiz data is incomplete");
          return;
        }
        setLoading(true);
        try {
          const id = await saveQuiz(quiz, questions);
          if (!id) {
            throw new Error("No quiz ID returned");
          }
          toast.success("🎯 Quiz started!");
          router.push(`/quiz/${id}`);
        } catch (err) {
          toast.error("💔 Could not start quiz!");
          console.error("Start quiz failed:", err);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Starting…" : "Start Quiz"}
    </Button>
  );
}

export function QuizSaveButton({
  quiz,
  questions,
}: {
  quiz: Quiz;
  questions: Question[];
}) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  return (
    <Button
      disabled={loading}
      onClick={async () => {
        if (!user) {
          toast.error("Please log in to save the quiz");
          return;
        }
        setLoading(true);
        try {
          await saveQuiz(quiz, questions);
          toast.success("🎉 Quiz saved!");
        } catch (err) {
          toast.error("💩 Quiz save failed!");
          console.error("Save failed:", err);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Saving…" : "Save Quiz"}
    </Button>
  );
}
