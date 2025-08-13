"use client";
import React, { use } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { exportQuizQuestions, exportQuizMarkscheme } from "../lib/quizExport";
import { Quiz, QuizQuestion } from "../app/types";
import { saveQuiz } from "../lib/supabase/saveQuiz";
import { toast } from "sonner";
import { useAuth } from "../components/AuthProvider";
import { useRouter } from "next/navigation";

export function ExportQuizButtons({
  quiz,
  questions,
}: {
  quiz: Quiz;
  questions: QuizQuestion[];
}) {
  return (
    <div>
      <Button
        variant="outline"
        onClick={() => {
          exportQuizQuestions(questions, quiz);
          if (quiz && questions) saveQuiz(quiz, questions);
          toast.success("Quiz exported and saved successfully!");
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
  questions: QuizQuestion[];
}) {
  const router = useRouter();
  const { supabase, user } = useAuth();
  const user_id = user?.id;
  const [loading, setLoading] = useState(false);
  return (
    <Button
      disabled={loading}
      onClick={async () => {
        if (!user_id) {
          console.error("User ID is null or undefined");
          return;
        }
        if (!quiz) {
          console.error("Quiz is null or undefined");
          return;
        }
        setLoading(true);
        try {
          const id = await saveQuiz(quiz, questions);
          if (!id) {
            console.error("No quiz ID returned from saveQuiz");
            return;
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
  questions: QuizQuestion[];
}) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      disabled={loading}
      onClick={async () => {
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
