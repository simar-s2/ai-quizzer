'use client';

import UploadForm from "../components/UploadForm";
import QuizPreview from "../components/QuizPreview";
import { useState } from "react";
import Spinner from "@/components/Spinner";

export default function Home() {
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  type QuizQuestion = {
    type: "mcq" | "fill" | "truefalse";
    question: string;
    options?: string[];
    answer: string;
  };

  const handleTextSubmit = async (text: string) => {
    setQuizQuestions([]); // Clear old quiz
    setLoading(true);     // Show spinner
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      setQuizQuestions(data.quiz);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // Hide spinner
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">🧠 AI Quiz Generator</h1>

        {/* Upload Form */}
        <UploadForm onTextSubmit={handleTextSubmit} />

        <hr className="my-6" />

        {/* Show Spinner or Quiz Preview */}
        {loading ? (
          <Spinner />
        ) : (
          quizQuestions.length > 0 && <QuizPreview questions={quizQuestions} />
        )}
      </div>
    </main>
  );
}
